'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles } from 'lucide-react';
import { useJarvisStore } from '@/stores/jarvis.store';
import { HudFrame } from './HudFrame';

type AuthTab = 'local' | 'ldap' | 'register';

export function AuthModal() {
  const [tab, setTab] = useState<AuthTab>('local');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginLdap } = useJarvisStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'ldap') {
        await loginLdap(username, password);
      } else if (tab === 'register') {
        const { api } = await import('@/lib/api');
        await api.register(email, password, name);
        await login(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <HudFrame title="Autenticação" className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-1">
            <Sparkles className="text-jarvis-cyan shrink-0" size={24} aria-hidden="true" />
            <h2 className="text-xl sm:text-2xl font-bold text-jarvis-cyan text-glow">MyJarvis</h2>
          </div>
          <p className="text-gray-400 text-sm mb-6 flex items-center gap-2">
            <Shield size={14} className="text-jarvis-gold/70" aria-hidden="true" />
            Autenticação obrigatória (RBAC)
          </p>

          <div className="flex gap-2 mb-6 text-xs sm:text-sm">
            {(['local', 'ldap', 'register'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-lg border transition-all font-mono uppercase tracking-wider text-[10px] sm:text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-jarvis-cyan/50 ${
                  tab === t
                    ? 'border-jarvis-cyan/50 bg-jarvis-cyan/10 text-jarvis-cyan'
                    : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                {t === 'local' ? 'Email' : t === 'ldap' ? 'LDAP' : 'Registrar'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <input
                type="text"
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-jarvis-cyan/50 focus:ring-1 focus:ring-jarvis-cyan/20 transition-colors"
              />
            )}
            {tab === 'ldap' ? (
              <input
                type="text"
                placeholder="Usuário LDAP"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-jarvis-cyan/50 focus:ring-1 focus:ring-jarvis-cyan/20 transition-colors"
              />
            ) : (
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-jarvis-cyan/50 focus:ring-1 focus:ring-jarvis-cyan/20 transition-colors"
              />
            )}
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={tab === 'ldap' ? 1 : 8}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-jarvis-cyan/50 focus:ring-1 focus:ring-jarvis-cyan/20 transition-colors"
            />
            {error && (
              <p className="text-red-400 text-sm font-mono" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-jarvis-cyan/20 text-jarvis-cyan border border-jarvis-cyan/30 hover:bg-jarvis-cyan/30 transition-all font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-jarvis-cyan/50 disabled:opacity-50"
            >
              {loading ? 'Aguarde...' : tab === 'register' ? 'Criar conta' : 'Entrar'}
            </button>
          </form>
        </HudFrame>
      </motion.div>
    </motion.div>
  );
}
