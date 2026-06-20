import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface HudFrameProps {
  children: ReactNode;
  className?: string;
  title?: string;
  variant?: 'default' | 'compact';
}

export function HudFrame({ children, className, title, variant = 'default' }: HudFrameProps) {
  return (
    <div
      className={clsx(
        'relative glass hud-panel',
        variant === 'compact' ? 'rounded-xl' : 'rounded-2xl',
        className,
      )}
    >
      <span className="hud-corner hud-corner-tl" />
      <span className="hud-corner hud-corner-tr" />
      <span className="hud-corner hud-corner-bl" />
      <span className="hud-corner hud-corner-br" />

      {title && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-1 border-b border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-jarvis-cyan animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-jarvis-cyan/70">
            {title}
          </span>
        </div>
      )}

      {children}
    </div>
  );
}
