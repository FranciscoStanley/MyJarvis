'use client';

import { motion } from 'framer-motion';
import { useJarvisStore } from '@/stores/jarvis.store';

export function JarvisOrb() {
  const { isListening, isSpeaking, isLoading } = useJarvisStore();
  const active = isListening || isSpeaking || isLoading;

  return (
    <div className="relative flex items-center justify-center w-48 h-48 md:w-64 md:h-64">
      <motion.div
        className="absolute inset-0 rounded-full border border-jarvis-cyan/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-4 rounded-full border border-jarvis-cyan/30"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />
      {active && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-jarvis-cyan/5"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-8 rounded-full bg-jarvis-cyan/10"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </>
      )}
      <div
        className={`relative w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center transition-all duration-500 ${
          active ? 'animate-pulse-glow bg-gradient-to-br from-jarvis-cyan/30 to-jarvis-glow/20' : 'bg-gradient-to-br from-jarvis-cyan/10 to-transparent'
        }`}
      >
        <span className="text-2xl md:text-3xl font-bold text-jarvis-cyan text-glow tracking-widest">J</span>
      </div>
      {isListening && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -bottom-8 text-jarvis-cyan text-sm font-mono"
        >
          Ouvindo...
        </motion.p>
      )}
      {isLoading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -bottom-8 text-jarvis-gold text-sm font-mono"
        >
          Processando...
        </motion.p>
      )}
    </div>
  );
}
