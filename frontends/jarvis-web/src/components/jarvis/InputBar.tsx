'use client';

import { useState, FormEvent } from 'react';
import { Mic, MicOff, Send, Volume2 } from 'lucide-react';
import { useJarvisStore } from '@/stores/jarvis.store';
import { useVoice } from '@/hooks/useVoice';

export function InputBar() {
  const [text, setText] = useState('');
  const { sendMessage, isLoading, isListening } = useJarvisStore();
  const { supported, startListening, stopListening, speak, isListening: listening } = useVoice();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    const msg = text.trim();
    setText('');
    await sendMessage(msg);
  };

  const toggleMic = () => {
    if (listening) stopListening();
    else startListening();
  };

  const speakLast = () => {
    const msgs = useJarvisStore.getState().messages;
    const last = msgs.filter((m) => m.role === 'assistant').at(-1);
    if (last) speak(last.content);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-white/5">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        {supported && (
          <button
            type="button"
            onClick={toggleMic}
            aria-label={listening ? 'Parar gravação' : 'Falar'}
            className={`p-3 rounded-full transition-all ${
              listening
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                : 'glass hover:bg-white/10 text-jarvis-cyan'
            }`}
          >
            {listening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        )}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Fale ou digite sua mensagem..."
          disabled={isLoading}
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-jarvis-cyan/50 placeholder:text-gray-500"
        />
        <button
          type="button"
          onClick={speakLast}
          aria-label="Ouvir última resposta"
          className="p-3 rounded-full glass hover:bg-white/10 text-jarvis-gold hidden sm:block"
        >
          <Volume2 size={20} />
        </button>
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          aria-label="Enviar"
          className="p-3 rounded-full bg-jarvis-cyan/20 text-jarvis-cyan border border-jarvis-cyan/30 hover:bg-jarvis-cyan/30 disabled:opacity-40 transition-all"
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
}
