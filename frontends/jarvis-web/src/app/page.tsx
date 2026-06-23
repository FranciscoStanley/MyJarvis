'use client';

import { useEffect, useState } from 'react';
import { useJarvisStore } from '@/stores/jarvis.store';
import { HudBackground } from '@/components/jarvis/HudBackground';
import { JarvisHeader } from '@/components/jarvis/JarvisHeader';
import { JarvisOrb } from '@/components/jarvis/JarvisOrb';
import { StatusPanel } from '@/components/jarvis/StatusPanel';
import { ChatPanel } from '@/components/jarvis/ChatPanel';
import { InputBar } from '@/components/jarvis/InputBar';
import { AuthModal } from '@/components/jarvis/AuthModal';
import { TermsAcceptModal } from '@/components/jarvis/TermsAcceptModal';
import { HudFrame } from '@/components/jarvis/HudFrame';
import { ConversationSidebar } from '@/components/jarvis/ConversationSidebar';

export default function HomePage() {
  const { isAuthenticated, needsTermsAcceptance, restoreSession, logout } = useJarvisStore();
  const [checking, setChecking] = useState(true);
  const [mobileConversationsOpen, setMobileConversationsOpen] = useState(false);

  useEffect(() => {
    restoreSession().finally(() => setChecking(false));
  }, [restoreSession]);

  if (checking) {
    return (
      <main className="min-h-dvh flex items-center justify-center relative">
        <HudBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-jarvis-cyan/30 border-t-jarvis-cyan animate-spin" />
          <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">
            Validando sessão...
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <HudBackground />
        <AuthModal />
      </>
    );
  }

  if (needsTermsAcceptance) {
    return (
      <>
        <HudBackground />
        <TermsAcceptModal />
      </>
    );
  }

  return (
    <main className="h-dvh flex flex-col relative overflow-hidden">
      <HudBackground />
      <JarvisHeader
        onLogout={logout}
        onOpenConversations={() => setMobileConversationsOpen(true)}
      />

      <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden lg:grid lg:grid-cols-[minmax(280px,360px)_1fr] lg:grid-rows-1 lg:gap-4 lg:p-4 max-w-[1600px] mx-auto w-full">
        {/* Painel lateral — orb + status */}
        <aside className="shrink-0 flex flex-col items-center gap-3 px-4 pt-3 pb-2 lg:py-0 lg:px-0 lg:sticky lg:top-4 lg:self-start">
          <HudFrame title="Núcleo JARVIS" variant="compact" className="w-full flex flex-col items-center py-4 sm:py-6 lg:py-8">
            <JarvisOrb />
          </HudFrame>
          <StatusPanel />
        </aside>

        {/* Painel de chat + histórico */}
        <HudFrame
          title="Interface de Comunicação"
          className="flex flex-col flex-1 min-h-0 overflow-hidden mx-4 mb-4 lg:mx-0 lg:mb-0 lg:h-full rounded-t-2xl lg:rounded-2xl"
        >
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <ConversationSidebar
              mobileOpen={mobileConversationsOpen}
              onMobileClose={() => setMobileConversationsOpen(false)}
            />
            <div className="flex flex-col flex-1 min-h-0 min-w-0">
              <ChatPanel />
              <InputBar />
            </div>
          </div>
        </HudFrame>
      </div>
    </main>
  );
}
