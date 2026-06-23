'use client';

import { LogOut, Shield, Sparkles } from 'lucide-react';
import { UserRole } from '@myjarvis/shared';
import { useJarvisStore } from '@/stores/jarvis.store';
import { ConversationSidebarToggle } from '@/components/jarvis/ConversationSidebar';

interface JarvisHeaderProps {
  onLogout: () => void;
  onOpenConversations?: () => void;
}

export function JarvisHeader({ onLogout, onOpenConversations }: JarvisHeaderProps) {
  const { userName, hasRole, isLoading, sessionId } = useJarvisStore();

  return (
    <header className="relative z-20 shrink-0 border-b border-white/5 bg-jarvis-bg/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4 max-w-[1600px] mx-auto w-full">
        <div className="flex items-center gap-3 min-w-0">
          {onOpenConversations && <ConversationSidebarToggle onClick={onOpenConversations} />}
          <div className="relative shrink-0">
            <Sparkles className="text-jarvis-cyan relative z-10" size={22} />
            <div className="absolute inset-0 blur-md bg-jarvis-cyan/40 rounded-full" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base md:text-lg font-semibold text-white tracking-wider truncate">
              MyJarvis
            </h1>
            <p className="text-[11px] md:text-xs text-gray-500 font-mono flex items-center gap-2 truncate">
              <span className="truncate">Bem-vindo, {userName}</span>
              {hasRole(UserRole.ADMIN) && (
                <span className="inline-flex items-center gap-1 text-jarvis-gold shrink-0">
                  <Shield size={11} aria-hidden="true" />
                  admin
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-gray-500">
          <StatusDot
            label={sessionId ? 'Online' : 'Standby'}
            active={!!sessionId}
          />
          <StatusDot
            label={isLoading ? 'Processando' : 'Pronto'}
            active={!isLoading}
            variant={isLoading ? 'gold' : 'cyan'}
          />
        </div>

        <button
          onClick={onLogout}
          className="shrink-0 p-2.5 rounded-lg glass hover:bg-white/10 text-gray-400 hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-jarvis-cyan/50"
          aria-label="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

function StatusDot({
  label,
  active,
  variant = 'cyan',
}: {
  label: string;
  active: boolean;
  variant?: 'cyan' | 'gold';
}) {
  const dotColor = variant === 'gold' ? 'bg-jarvis-gold' : 'bg-jarvis-cyan';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? dotColor : 'bg-gray-600'} ${active ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
