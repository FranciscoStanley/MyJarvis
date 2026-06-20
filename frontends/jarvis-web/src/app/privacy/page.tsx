import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-[#0a0e17] text-gray-200 p-6 sm:p-10 max-w-3xl mx-auto">
      <Link href="/" className="text-jarvis-cyan text-sm hover:underline mb-8 inline-block">
        ← Voltar ao MyJarvis
      </Link>
      <h1 className="text-2xl font-bold text-jarvis-cyan mb-2">Política de Privacidade</h1>
      <p className="text-gray-500 text-sm mb-8">Versão 2026-06-01 · LGPD</p>

      <article className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-lg text-white font-semibold">Dados coletados</h2>
          <p>Nome, e-mail, hash de senha, papel de acesso, registro de aceite dos termos e token JWT no navegador.</p>
        </section>
        <section>
          <h2 className="text-lg text-white font-semibold">Finalidade</h2>
          <p>Autenticação, controle de acesso, operação do assistente e cumprimento legal.</p>
        </section>
        <section>
          <h2 className="text-lg text-white font-semibold">Seus direitos (LGPD)</h2>
          <p>Acesso, correção, eliminação e informação sobre tratamento — solicite ao desenvolvedor.</p>
        </section>
        <section>
          <h2 className="text-lg text-white font-semibold">Controlador</h2>
          <p>
            <strong className="text-white">Francisco Stanley Rodrigues Albuquerque</strong>
          </p>
        </section>
        <p className="text-xs text-gray-600 pt-4">
          Documento completo: repositório em docs/privacy-policy.md
        </p>
      </article>
    </main>
  );
}
