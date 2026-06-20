'use client';

import { motion } from 'framer-motion';
import { useJarvisStore } from '@/stores/jarvis.store';

const TICK_COUNT = 24;

export function JarvisOrb() {
  const { isListening, isSpeaking, isLoading } = useJarvisStore();
  const active = isListening || isSpeaking || isLoading;

  const statusText = isListening
    ? 'Ouvindo...'
    : isLoading
      ? 'Processando...'
      : isSpeaking
        ? 'Falando...'
        : null;

  return (
    <div
      className="relative flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56"
      role="img"
      aria-label={statusText ?? 'JARVIS — assistente ativo'}
    >
      {/* Arco externo com ticks */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <circle
          cx="100"
          cy="100"
          r="96"
          fill="none"
          stroke="rgba(34,211,238,0.15)"
          strokeWidth="0.5"
        />
        {Array.from({ length: TICK_COUNT }).map((_, i) => {
          const angle = (i / TICK_COUNT) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const x1 = 100 + 88 * Math.cos(rad);
          const y1 = 100 + 88 * Math.sin(rad);
          const x2 = 100 + (i % 3 === 0 ? 94 : 91) * Math.cos(rad);
          const y2 = 100 + (i % 3 === 0 ? 94 : 91) * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 3 === 0 ? 'rgba(34,211,238,0.4)' : 'rgba(34,211,238,0.15)'}
              strokeWidth={i % 3 === 0 ? 1 : 0.5}
            />
          );
        })}
        <motion.circle
          cx="100"
          cy="100"
          r="82"
          fill="none"
          stroke="rgba(34,211,238,0.25)"
          strokeWidth="1"
          strokeDasharray="40 20"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '100px 100px' }}
        />
      </svg>

      {/* Anéis rotativos */}
      <motion.div
        className="absolute inset-2 rounded-full border border-jarvis-cyan/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-6 rounded-full border border-dashed border-jarvis-cyan/15"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-10 rounded-full border border-jarvis-cyan/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />

      {/* Pulso quando ativo */}
      {active && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-jarvis-cyan/5"
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-6 rounded-full border border-jarvis-cyan/20"
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </>
      )}

      {/* Núcleo */}
      <div
        className={`relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full flex items-center justify-center transition-all duration-500 ${
          active
            ? 'animate-pulse-glow bg-gradient-to-br from-jarvis-cyan/30 to-jarvis-glow/20'
            : 'bg-gradient-to-br from-jarvis-cyan/10 to-jarvis-bg/50'
        }`}
      >
        <div className="absolute inset-1 rounded-full border border-jarvis-cyan/20" />
        <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-jarvis-cyan text-glow tracking-[0.3em] pl-[0.15em]">
          J
        </span>
      </div>

      {/* Status */}
      {statusText && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute -bottom-6 sm:-bottom-8 text-xs sm:text-sm font-mono ${
            isLoading || isSpeaking ? 'text-jarvis-gold' : 'text-jarvis-cyan'
          }`}
        >
          {statusText}
        </motion.p>
      )}
    </div>
  );
}
