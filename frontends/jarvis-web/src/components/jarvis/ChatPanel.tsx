'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import { useJarvisStore } from '@/stores/jarvis.store';
import { getYoutubeEmbedUrl } from '@/lib/youtube';
import { ActionPrompt } from '@/components/jarvis/ActionPrompt';

export function ChatPanel() {
  const { messages, confirmAction, isLoading } = useJarvisStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 min-h-0">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full bg-jarvis-cyan/10 border border-jarvis-cyan/20 flex items-center justify-center">
            <Bot className="text-jarvis-cyan" size={28} aria-hidden="true" />
          </div>
          <Sparkles
            className="absolute -top-1 -right-1 text-jarvis-gold/80"
            size={16}
            aria-hidden="true"
          />
        </div>
        <p className="text-sm sm:text-base text-gray-400 text-center max-w-md leading-relaxed">
          <span className="block text-jarvis-cyan font-mono text-xs uppercase tracking-widest mb-3">
            Interface de Comunicação
          </span>
          Bom dia, senhor. Sou o JARVIS, seu assistente pessoal.
          Converse comigo naturalmente — busco, resumo e executo ações quando você confirmar.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {['Buscar e abrir', 'Reproduzir música', 'Conversar'].map((hint) => (
            <span
              key={hint}
              className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-500 border border-white/10 rounded-full bg-white/[0.02]"
            >
              {hint}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4 min-h-0 hud-scrollbar"
      role="log"
      aria-live="polite"
      aria-label="Histórico de conversa"
    >
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[80%] lg:max-w-[75%] rounded-xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-jarvis-cyan/10 border border-jarvis-cyan/25 text-white'
                  : 'bg-white/[0.04] border border-white/10 text-gray-200'
              }`}
            >
              {msg.role === 'assistant' && (
                <span className="text-[10px] text-jarvis-cyan font-mono uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-jarvis-cyan" aria-hidden="true" />
                  JARVIS
                </span>
              )}
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>

              {msg.embedUrl && (() => {
                const embedUrl = getYoutubeEmbedUrl(msg.embedUrl);
                if (!embedUrl) return null;
                return (
                  <div className="mt-3 rounded-lg overflow-hidden border border-white/10 aspect-video">
                    <iframe
                      src={`${embedUrl}?autoplay=1`}
                      title="Reprodução JARVIS"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              })()}

              {msg.searchResults && msg.searchResults.length > 0 && !msg.embedUrl && (() => {
                const results = msg.searchResults as { title: string; url: string; thumbnail?: string }[];
                const firstYoutube = results.find((r) => getYoutubeEmbedUrl(r.url));
                const embedUrl = firstYoutube ? getYoutubeEmbedUrl(firstYoutube.url) : null;

                return (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                    {embedUrl && (
                      <div className="rounded-lg overflow-hidden border border-white/10 aspect-video">
                        <iframe
                          src={embedUrl}
                          title={firstYoutube?.title ?? 'Reprodução de vídeo'}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      {results.slice(0, 3).map((r, i) => (
                        <a
                          key={i}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-jarvis-cyan hover:underline group"
                        >
                          {r.thumbnail && (
                            // eslint-disable-next-line @next/next/no-img-element -- thumbnail externo dinâmico de busca
                            <img
                              src={r.thumbnail}
                              alt=""
                              className="w-8 h-8 rounded object-cover border border-white/10 group-hover:border-jarvis-cyan/30 transition-colors"
                            />
                          )}
                          <span className="truncate">{r.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {msg.clientActions && msg.clientActions.length > 0 && (
                <ActionPrompt
                  actions={msg.clientActions}
                  onConfirm={(action) => confirmAction(action)}
                  disabled={isLoading}
                />
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
