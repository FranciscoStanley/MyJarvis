'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useJarvisStore } from '@/stores/jarvis.store';
import { api } from '@/lib/api';
import { stripTextForSpeech } from '@/lib/client-actions';

/** Tempo de silêncio contínuo antes de encerrar a captura e enviar a mensagem. */
export const VOICE_SILENCE_END_DELAY_MS = 3000;

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResult;
  };
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

/** Monta o transcript completo a partir de todos os segmentos reconhecidos. */
export function buildTranscriptFromResults(event: SpeechRecognitionEvent): string {
  let transcript = '';
  for (let i = 0; i < event.results.length; i++) {
    transcript += event.results[i][0].transcript;
  }
  return transcript.trim();
}

/** Fallback: voz pt-BR do sistema quando Piper está offline. */
function selectBrowserVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const preferred = [
    (v: SpeechSynthesisVoice) => v.lang === 'pt-BR' && /Antonio|Francisco|Google português/i.test(v.name),
    (v: SpeechSynthesisVoice) => v.lang === 'pt-BR' && /Microsoft.*Portug/i.test(v.name),
    (v: SpeechSynthesisVoice) => v.lang === 'pt-BR',
    (v: SpeechSynthesisVoice) => v.lang.startsWith('pt'),
  ];

  for (const match of preferred) {
    const voice = voices.find(match);
    if (voice) return voice;
  }
  return voices[0];
}

function speakWithBrowser(text: string, setSpeaking: (v: boolean) => void, voices: SpeechSynthesisVoice[]) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = selectBrowserVoice(voices);
  utterance.lang = voice?.lang ?? 'pt-BR';
  utterance.rate = 0.95;
  utterance.pitch = 1;
  if (voice) utterance.voice = voice;
  utterance.onstart = () => setSpeaking(true);
  utterance.onend = () => setSpeaking(false);
  utterance.onerror = () => setSpeaking(false);
  window.speechSynthesis.speak(utterance);
}

export function useVoice() {
  const { sendMessage, confirmAction, setListening, setSpeaking, isListening } = useJarvisStore();
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [supported, setSupported] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptRef = useRef('');
  const isListeningRef = useRef(false);
  const isFinalizingRef = useRef(false);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setSupported(!!SR);
    if (SR) {
      const rec = new SR();
      rec.lang = 'pt-BR';
      rec.continuous = true;
      rec.interimResults = true;
      recognitionRef.current = rec;
    }

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis?.getVoices() ?? [];
    };
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
      audioRef.current?.pause();
      clearSilenceTimer();
    };
  }, [clearSilenceTimer]);

  const speak = useCallback(async (text: string) => {
    const spoken = stripTextForSpeech(text);
    if (!spoken) return;

    audioRef.current?.pause();
    window.speechSynthesis?.cancel();

    try {
      const result = await api.synthesizeSpeech(spoken);

      if (!result.clientSide && result.audioBase64 && result.format === 'wav') {
        const audio = new Audio(`data:audio/wav;base64,${result.audioBase64}`);
        audioRef.current = audio;
        audio.onplay = () => setSpeaking(true);
        audio.onended = () => setSpeaking(false);
        audio.onerror = () => setSpeaking(false);
        try {
          await audio.play();
        } catch {
          setSpeaking(false);
          speakWithBrowser(spoken, setSpeaking, voicesRef.current);
        }
        return;
      }
    } catch {
      /* fallback abaixo */
    }

    speakWithBrowser(spoken, setSpeaking, voicesRef.current);
  }, [setSpeaking]);

  const finalizeListening = useCallback(async (transcript: string) => {
    if (isFinalizingRef.current) return;
    isFinalizingRef.current = true;

    clearSilenceTimer();
    isListeningRef.current = false;
    setListening(false);
    setLiveTranscript('');
    transcriptRef.current = '';

    const trimmed = transcript.trim();
    if (trimmed) {
      const { pendingClientActions } = useJarvisStore.getState();
      if (pendingClientActions.length) {
        await confirmAction(trimmed);
      } else {
        await sendMessage(trimmed);
      }

      const lastMsg = useJarvisStore.getState().messages.at(-1);
      if (lastMsg?.role === 'assistant') await speak(lastMsg.content);
    }

    isFinalizingRef.current = false;
  }, [clearSilenceTimer, confirmAction, sendMessage, setListening, speak]);

  const scheduleSilenceStop = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      silenceTimerRef.current = null;
      recognitionRef.current?.stop();
      void finalizeListening(transcriptRef.current);
    }, VOICE_SILENCE_END_DELAY_MS);
  }, [clearSilenceTimer, finalizeListening]);

  const startListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || isListening) return;

    isFinalizingRef.current = false;
    transcriptRef.current = '';
    setLiveTranscript('');
    isListeningRef.current = true;

    rec.onresult = (event) => {
      const transcript = buildTranscriptFromResults(event);
      transcriptRef.current = transcript;
      setLiveTranscript(transcript);
      scheduleSilenceStop();
    };

    rec.onerror = () => {
      clearSilenceTimer();
      isListeningRef.current = false;
      setListening(false);
      setLiveTranscript('');
      transcriptRef.current = '';
    };

    rec.onend = () => {
      if (!isListeningRef.current || isFinalizingRef.current) return;
      try {
        rec.start();
      } catch {
        isListeningRef.current = false;
        setListening(false);
        setLiveTranscript('');
        transcriptRef.current = '';
      }
    };

    setListening(true);
    rec.start();
  }, [clearSilenceTimer, isListening, scheduleSilenceStop, setListening]);

  const stopListening = useCallback(() => {
    if (!isListeningRef.current) return;

    isListeningRef.current = false;
    clearSilenceTimer();
    recognitionRef.current?.stop();
    void finalizeListening(transcriptRef.current);
  }, [clearSilenceTimer, finalizeListening]);

  return { supported, startListening, stopListening, speak, isListening, liveTranscript };
}
