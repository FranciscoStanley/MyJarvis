import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-[#0a0e17] text-gray-200 p-6 sm:p-10 max-w-3xl mx-auto">
      <Link href="/" className="text-jarvis-cyan text-sm hover:underline mb-8 inline-block">
        ← Voltar ao MyJarvis
      </Link>
      <h1 className="text-2xl font-bold text-jarvis-cyan mb-2">Termos de Uso</h1>
      <p className="text-gray-500 text-sm mb-8">Versão 2026-06-01 · Francisco Stanley Rodrigues Albuquerque</p>

      <article className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-lg text-white font-semibold">1. Aceitação e responsabilidade</h2>
          <p>
            Ao utilizar o MyJarvis, você aceita estes termos e assume responsabilidade pelo uso
            da plataforma e pelas instruções enviadas ao assistente JARVIS.
          </p>
        </section>
        <section>
          <h2 className="text-lg text-white font-semibold">2. O que o serviço oferece</h2>
          <p>
            Assistente de IA com conversação, voz, buscas, consulta a documentação técnica e
            orientação de desenvolvimento. Não substitui aconselhamento profissional certificado.
          </p>
        </section>
        <section>
          <h2 className="text-lg text-white font-semibold">3. Uso proibido</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li>Ataques, invasões, DDoS, malware ou derrubada de sistemas</li>
            <li>Roubo de dados, acesso não autorizado a contas ou engenharia social maliciosa</li>
            <li>Violação de leis, direitos humanos ou LGPD</li>
            <li>Criação de cheats, ferramentas de fraude ou sistemas para ataques cibernéticos</li>
          </ul>
          <p className="mt-3">
            O JARVIS possui diretrizes de segurança definidas pelo desenvolvedor e recusará
            solicitações antiéticas ou ilegais.
          </p>
        </section>
        <section>
          <h2 className="text-lg text-white font-semibold">4. Desenvolvedor</h2>
          <p>
            MyJarvis e JARVIS foram desenvolvidos por{' '}
            <strong className="text-white">Francisco Stanley Rodrigues Albuquerque</strong>.
          </p>
        </section>
        <p className="text-xs text-gray-600 pt-4">
          Documento completo: repositório em docs/terms-of-use.md
        </p>
      </article>
    </main>
  );
}
