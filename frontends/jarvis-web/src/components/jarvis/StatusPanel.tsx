'use client';

import { useEffect, useState } from 'react';
import { Activity, Cpu, MessageSquare, Wifi } from 'lucide-react';
import { useJarvisStore } from '@/stores/jarvis.store';
import { HudFrame } from './HudFrame';

export function StatusPanel() {
  const { messages, isListening, isSpeaking, isLoading, sessionId } = useJarvisStore();
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const status = isListening
    ? { label: 'Ouvindo', color: 'text-jarvis-cyan' }
    : isSpeaking
      ? { label: 'Falando', color: 'text-jarvis-gold' }
      : isLoading
        ? { label: 'Processando', color: 'text-jarvis-gold' }
        : { label: 'Standby', color: 'text-gray-400' };

  const metrics = [
    { icon: MessageSquare, label: 'Mensagens', value: String(messages.length) },
    { icon: Wifi, label: 'Sessão', value: sessionId ? 'Ativa' : '—' },
    { icon: Cpu, label: 'Motor', value: 'Ollama' },
    { icon: Activity, label: 'Status', value: status.label },
  ];

  return (
    <HudFrame title="Sistemas" variant="compact" className="w-full">
      <div className="p-4 space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
            Horário local
          </span>
          <time className="text-lg font-mono text-jarvis-cyan tabular-nums">{time}</time>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {metrics.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/5"
            >
              <Icon size={14} className="text-jarvis-cyan/60 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[9px] font-mono uppercase tracking-wider text-gray-500 truncate">
                  {label}
                </p>
                <p
                  className={`text-xs font-mono truncate ${
                    label === 'Status' ? status.color : 'text-gray-300'
                  }`}
                >
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </HudFrame>
  );
}
