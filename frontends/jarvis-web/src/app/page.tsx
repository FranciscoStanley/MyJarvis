'use client';

import { useEffect, useState } from 'react';
import { LogOut, Shield, Sparkles } from 'lucide-react';
import { UserRole } from '@myjarvis/shared';
import { useJarvisStore } from '@/stores/jarvis.store';
import { JarvisOrb } from '@/components/jarvis/JarvisOrb';
import { ChatPanel } from '@/components/jarvis/ChatPanel';
import { InputBar } from '@/components/jarvis/InputBar';
import { AuthModal } from '@/components/jarvis/AuthModal';

export default function HomePage() {
  const { isAuthenticated, userName, userRoles, restoreSession, logout, hasRole } = useJarvisStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    restoreSession().finally(() => setChecking(false));
  }, [restoreSession]);

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-400">
        Validando sessão...
      </main>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <main className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-jarvis-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-jarvis-glow/5 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between p-4 md:p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Sparkles className="text-jarvis-cyan" size={24} />
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">MyJarvis</h1>
            <p className="text-xs text-gray-500 font-mono flex items-center gap-2">
              Bem-vindo, {userName}
              {hasRole(UserRole.ADMIN) && (
                <span className="inline-flex items-center gap-1 text-jarvis-gold">
                  <Shield size={12} /> admin
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-lg glass hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          aria-label="Sair"
        >
          <LogOut size={18} />
        </button>
      </header>

      <section className="relative z-10 flex flex-col items-center py-6 md:py-10">
        <JarvisOrb />
      </section>

      <section className="relative z-10 flex-1 flex flex-col max-w-4xl w-full mx-auto glass rounded-t-3xl md:rounded-3xl md:mb-6 md:mx-6 overflow-hidden min-h-[40vh]">
        <ChatPanel />
        <InputBar />
      </section>
    </main>
  );
}
