'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { MessageSquarePlus, MessagesSquare, Trash2, X } from 'lucide-react';
import { useJarvisStore } from '@/stores/jarvis.store';

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

interface ConversationSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function ConversationSidebar({ mobileOpen = false, onMobileClose }: ConversationSidebarProps) {
  const {
    conversations,
    sessionId,
    isLoadingConversations,
    selectConversation,
    createNewChat,
    deleteConversation,
    isSessionLoading,
  } = useJarvisStore();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingId) return;
    setDeletingId(id);
    try {
      await deleteConversation(id);
    } finally {
      setDeletingId(null);
    }
  };

  const content = (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <MessagesSquare size={16} className="text-jarvis-cyan shrink-0" aria-hidden="true" />
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-jarvis-cyan/70 truncate">
            Conversas
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => void createNewChat()}
            className="p-2 rounded-lg text-jarvis-cyan hover:bg-jarvis-cyan/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-jarvis-cyan/50"
            aria-label="Nova conversa"
            title="Nova conversa"
          >
            <MessageSquarePlus size={16} />
          </button>
          {onMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-jarvis-cyan/50"
              aria-label="Fechar lista de conversas"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 py-2">
        {isLoadingConversations && conversations.length === 0 ? (
          <p className="px-4 py-6 text-xs text-gray-500 font-mono text-center">Carregando...</p>
        ) : conversations.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-400">Nenhuma conversa ainda</p>
            <p className="text-xs text-gray-600 mt-1">Inicie um diálogo com JARVIS</p>
          </div>
        ) : (
          <ul className="space-y-1 px-2" role="listbox" aria-label="Lista de conversas">
            {conversations.map((conv) => {
              const active = conv.id === sessionId;
              const processing = isSessionLoading(conv.id);
              return (
                <li key={conv.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => void selectConversation(conv.id)}
                    className={clsx(
                      'group w-full text-left rounded-xl px-3 py-2.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-jarvis-cyan/50',
                      active
                        ? 'bg-jarvis-cyan/10 border border-jarvis-cyan/25'
                        : 'hover:bg-white/5 border border-transparent',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p
                          className={clsx(
                            'text-sm truncate flex items-center gap-2',
                            active ? 'text-white font-medium' : 'text-gray-300',
                          )}
                        >
                          {processing && (
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full bg-jarvis-cyan animate-pulse shrink-0"
                              aria-label="Processando"
                            />
                          )}
                          {conv.title}
                        </p>
                        {conv.preview && (
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">{conv.preview}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] font-mono text-gray-600">
                          {formatRelativeTime(conv.updatedAt)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => void handleDelete(conv.id, e)}
                          disabled={deletingId === conv.id}
                          className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-40"
                          aria-label={`Excluir conversa ${conv.title}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-white/5 min-h-0">
        {content}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Fechar lista de conversas"
            onClick={onMobileClose}
          />
          <aside className="relative z-10 w-[min(88vw,320px)] h-full glass hud-panel rounded-r-2xl shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

export function ConversationSidebarToggle({ onClick }: { onClick: () => void }) {
  const { conversations } = useJarvisStore();

  return (
    <button
      type="button"
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-jarvis-cyan hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-jarvis-cyan/50"
      aria-label="Abrir conversas"
    >
      <MessagesSquare size={18} />
      {conversations.length > 0 && (
        <span className="sr-only">{conversations.length} conversas</span>
      )}
    </button>
  );
}
