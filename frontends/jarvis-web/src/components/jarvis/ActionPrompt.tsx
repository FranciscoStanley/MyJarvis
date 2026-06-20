'use client';

import { ExternalLink, Music, Play, Youtube } from 'lucide-react';
import type { ClientAction } from '@myjarvis/shared';

interface ActionPromptProps {
  actions: ClientAction[];
  onConfirm: (action: ClientAction) => void;
  disabled?: boolean;
}

const ICONS: Record<string, typeof Play> = {
  play_embed: Play,
  open_url: ExternalLink,
  open_app: Music,
  youtube: Youtube,
  spotify: Music,
};

function ActionIcon({ action }: { action: ClientAction }) {
  const Icon = action.app ? ICONS[action.app] ?? ICONS.open_app : ICONS[action.type] ?? ExternalLink;
  return <Icon size={14} aria-hidden="true" />;
}

export function ActionPrompt({ actions, onConfirm, disabled }: ActionPromptProps) {
  const pending = actions.filter((a) => a.requiresConfirmation);
  if (!pending.length) return null;

  return (
    <div className="mt-3 pt-3 border-t border-white/10 space-y-2" role="group" aria-label="Ações disponíveis">
      <p className="text-[10px] font-mono uppercase tracking-widest text-jarvis-gold/80">
        Confirme a ação
      </p>
      <div className="flex flex-wrap gap-2">
        {pending.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={disabled}
            onClick={() => onConfirm(action)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-jarvis-cyan/30 bg-jarvis-cyan/10 text-jarvis-cyan hover:bg-jarvis-cyan/20 hover:border-jarvis-cyan/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ActionIcon action={action} />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
