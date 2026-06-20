'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Shield } from 'lucide-react';
import { useJarvisStore } from '@/stores/jarvis.store';
import { HudFrame } from './HudFrame';

export function TermsAcceptModal() {
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { acceptTerms } = useJarvisStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      setError('É necessário aceitar os Termos de Uso e a Política de Privacidade.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await acceptTerms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar aceite');
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
        className="w-full max-w-lg"
      >
        <HudFrame title="Termos de Uso" className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-jarvis-cyan shrink-0" size={22} aria-hidden="true" />
            <h2 className="text-lg font-bold text-jarvis-cyan">Acordo de Utilização</h2>
          </div>

          <div className="text-sm text-gray-300 space-y-3 mb-6 max-h-48 overflow-y-auto pr-2 leading-relaxed">
            <p>
              Antes de utilizar o JARVIS, leia e aceite os termos. Ao continuar, você assume
              responsabilidade pelo uso da plataforma e pelas ações solicitadas ao assistente.
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-1 text-xs">
              <li>O JARVIS é um assistente de IA — respostas podem conter imprecisões</li>
              <li>Uso proibido: ataques, invasões, fraudes, violação de leis e direitos humanos</li>
              <li>Dados tratados conforme LGPD — veja a Política de Privacidade</li>
              <li>Desenvolvido por Francisco Stanley Rodrigues Albuquerque</li>
            </ul>
            <p className="text-xs text-gray-500">
              Este aceite é registrado uma vez e não será solicitado novamente em logins futuros,
              salvo atualização dos termos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 rounded border-white/20 bg-white/5 text-jarvis-cyan focus:ring-jarvis-cyan/50"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                Li e aceito os{' '}
                <Link href="/terms" target="_blank" className="text-jarvis-cyan hover:underline">
                  Termos de Uso
                </Link>
                {' '}e a{' '}
                <Link href="/privacy" target="_blank" className="text-jarvis-cyan hover:underline">
                  Política de Privacidade
                </Link>
                . Assumo as responsabilidades descritas.
              </span>
            </label>

            {error && (
              <p className="text-red-400 text-sm font-mono flex items-center gap-2" role="alert">
                <Shield size={14} aria-hidden="true" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !accepted}
              className="w-full py-3 rounded-lg bg-jarvis-cyan/20 text-jarvis-cyan border border-jarvis-cyan/30 hover:bg-jarvis-cyan/30 transition-all font-medium disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Aceitar e continuar'}
            </button>
          </form>
        </HudFrame>
      </motion.div>
    </motion.div>
  );
}
