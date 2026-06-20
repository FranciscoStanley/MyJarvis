'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useJarvisStore } from '@/stores/jarvis.store';
import { api } from '@/lib/api';
import { stripTextForSpeech } from '@/lib/client-actions';

interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
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

/** Fallback: voz neural en-GB do sistema quando Piper está offline. */
function selectBrowserVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const preferred = [
    (v: SpeechSynthesisVoice) => v.name.includes('Google UK English Male'),
    (v: SpeechSynthesisVoice) => v.name.includes('Microsoft Ryan') && v.lang.startsWith('en'),
    (v: SpeechSynthesisVoice) => v.name.includes('Daniel') && v.lang.startsWith('en-GB'),
    (v: SpeechSynthesisVoice) => v.name.includes('Microsoft George') && v.lang.startsWith('en-GB'),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en-GB'),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
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
  utterance.lang = voice?.lang ?? 'en-GB';
  utterance.rate = 0.9;
  utterance.pitch = 0.85;
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
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setSupported(!!SR);
    if (SR) {
      const rec = new SR();
      rec.lang = 'pt-BR';
      rec.continuous = false;
      rec.interimResults = false;
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
    };
  }, []);

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

  const startListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || isListening) return;

    rec.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setListening(false);

      const { pendingClientActions } = useJarvisStore.getState();
      if (pendingClientActions.length) {
        await confirmAction(transcript);
      } else {
        await sendMessage(transcript);
      }

      const lastMsg = useJarvisStore.getState().messages.at(-1);
      if (lastMsg?.role === 'assistant') await speak(lastMsg.content);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    setListening(true);
    rec.start();
  }, [isListening, sendMessage, confirmAction, setListening, speak]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, [setListening]);

  return { supported, startListening, stopListening, speak, isListening };
}
