'use client';

import { useState, FormEvent } from 'react';
import { Mic, MicOff, Send, Volume2 } from 'lucide-react';
import { useJarvisStore } from '@/stores/jarvis.store';
import { useVoice } from '@/hooks/useVoice';

export function InputBar() {
  const [text, setText] = useState('');
  const { sendMessage, isLoading } = useJarvisStore();
  const { supported, startListening, stopListening, speak, isListening: listening } = useVoice();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    const msg = text.trim();
    setText('');
    await sendMessage(msg);
    const lastMsg = useJarvisStore.getState().messages.at(-1);
    if (lastMsg?.role === 'assistant') await speak(lastMsg.content);
  };

  const toggleMic = () => {
    if (listening) stopListening();
    else startListening();
  };

  const speakLast = async () => {
    const msgs = useJarvisStore.getState().messages;
    const last = msgs.filter((m) => m.role === 'assistant').at(-1);
    if (last) await speak(last.content);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 p-3 sm:p-4 border-t border-white/5 bg-jarvis-bg/50 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 w-full">
        {supported && (
          <button
            type="button"
            onClick={toggleMic}
            aria-label={listening ? 'Parar gravação' : 'Falar'}
            aria-pressed={listening}
            className={`shrink-0 p-2.5 sm:p-3 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-jarvis-cyan/50 ${
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
          aria-label="Mensagem para o JARVIS"
          className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-jarvis-cyan/50 focus:ring-1 focus:ring-jarvis-cyan/20 placeholder:text-gray-500 disabled:opacity-50 transition-colors"
        />
        <button
          type="button"
          onClick={speakLast}
          aria-label="Ouvir última resposta"
          className="shrink-0 p-2.5 sm:p-3 rounded-full glass hover:bg-white/10 text-jarvis-gold hidden sm:flex focus:outline-none focus-visible:ring-2 focus-visible:ring-jarvis-gold/50"
        >
          <Volume2 size={20} />
        </button>
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          aria-label="Enviar"
          className="shrink-0 p-2.5 sm:p-3 rounded-full bg-jarvis-cyan/20 text-jarvis-cyan border border-jarvis-cyan/30 hover:bg-jarvis-cyan/30 disabled:opacity-40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-jarvis-cyan/50"
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
}
