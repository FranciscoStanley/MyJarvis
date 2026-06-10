'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJarvisStore } from '@/stores/jarvis.store';

export function ChatPanel() {
  const { messages } = useJarvisStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-500 text-center max-w-md">
          Bom dia, senhor. Sou o JARVIS, seu assistente pessoal.
          Pergunte-me qualquer coisa — buscas, imagens, vídeos, músicas ou simplesmente converse comigo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-jarvis-cyan/10 border border-jarvis-cyan/20 text-white'
                  : 'glass text-gray-200'
              }`}
            >
              {msg.role === 'assistant' && (
                <span className="text-xs text-jarvis-cyan font-mono mb-1 block">JARVIS</span>
              )}
              <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              {msg.searchResults && msg.searchResults.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  {(msg.searchResults as { title: string; url: string; thumbnail?: string }[]).slice(0, 3).map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-jarvis-cyan hover:underline"
                    >
                      {r.thumbnail && <img src={r.thumbnail} alt="" className="w-8 h-8 rounded object-cover" />}
                      <span className="truncate">{r.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
