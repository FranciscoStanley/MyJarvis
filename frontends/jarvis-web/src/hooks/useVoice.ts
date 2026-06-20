'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useJarvisStore } from '@/stores/jarvis.store';
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

/** Preferência de voz estilo JARVIS: inglês britânico masculino, tom grave e pausado. */
function selectJarvisVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const preferred = [
    (v: SpeechSynthesisVoice) => v.name.includes('Google UK English Male'),
    (v: SpeechSynthesisVoice) => v.name.includes('Daniel') && v.lang.startsWith('en-GB'),
    (v: SpeechSynthesisVoice) => v.name.includes('Microsoft George') && v.lang.startsWith('en-GB'),
    (v: SpeechSynthesisVoice) => v.lang === 'en-GB' && /male|daniel|george|ryan/i.test(v.name),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en-GB'),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('pt-BR'),
  ];

  for (const match of preferred) {
    const voice = voices.find(match);
    if (voice) return voice;
  }
  return voices[0];
}

export function useVoice() {
  const { sendMessage, confirmAction, setListening, setSpeaking, isListening } = useJarvisStore();
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [supported, setSupported] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

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
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    const spoken = stripTextForSpeech(text);
    if (!spoken) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(spoken);
    const voice = selectJarvisVoice(voicesRef.current);
    utterance.lang = voice?.lang ?? 'en-GB';
    utterance.rate = 0.92;
    utterance.pitch = 0.82;
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
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
      if (lastMsg?.role === 'assistant') speak(lastMsg.content);
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
