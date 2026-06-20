import { TECH_DOC_SOURCES, TechDocSource } from '../constants/tech-docs-registry';

export interface TechDocsSearchResult {
  optimizedQuery: string;
  source: TechDocSource | null;
  technology: string;
  topic: string;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

/** Resolve tecnologia por alias (nest → NestJS, c# → .NET, etc.). */
export function resolveTechSource(technology: string): TechDocSource | null {
  const norm = normalize(technology);
  if (!norm) return null;

  const exact = TECH_DOC_SOURCES.find((s) =>
    s.aliases.some((a) => normalize(a) === norm),
  );
  if (exact) return exact;

  return TECH_DOC_SOURCES.find((s) =>
    s.aliases.some((a) => {
      const alias = normalize(a);
      return norm.includes(alias) || alias.includes(norm);
    }),
  ) ?? null;
}

/** Detecta tecnologia mencionada em texto livre do usuário. */
export function detectTechnologyInText(text: string): TechDocSource | null {
  const norm = normalize(text);
  let best: { source: TechDocSource; score: number } | null = null;

  for (const source of TECH_DOC_SOURCES) {
    for (const alias of source.aliases) {
      const aliasNorm = normalize(alias);
      if (aliasNorm.length < 2) continue;
      const pattern = new RegExp(`\\b${aliasNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (pattern.test(norm)) {
        const score = aliasNorm.length;
        if (!best || score > best.score) best = { source, score };
      }
    }
  }

  return best?.source ?? null;
}

/** Monta query otimizada para documentação oficial (site: operator). */
export function buildTechDocsSearchQuery(technology: string, topic: string): TechDocsSearchResult {
  const source = resolveTechSource(technology);
  const cleanTopic = topic.trim() || technology.trim();

  if (source) {
    return {
      optimizedQuery: `site:${source.site} ${cleanTopic}`,
      source,
      technology: source.label,
      topic: cleanTopic,
    };
  }

  return {
    optimizedQuery: `${technology} official documentation ${cleanTopic}`,
    source: null,
    technology: technology.trim(),
    topic: cleanTopic,
  };
}

/** Extrai tópico de pedidos como "documentação do Nest sobre guards". */
export function extractDocsTopic(text: string, technology?: string): string {
  let topic = text
    .replace(/^(?:jarvis,?\s*)/i, '')
    .replace(
      /^(?:busca|busque|pesquisa|pesquise|procure|encontre|consulte|veja|olhe)\s+(?:na\s+)?(?:documenta[cç][aã]o|docs?)\s+(?:oficial\s+)?(?:do|da|de)?\s*/i,
      '',
    )
    .replace(
      /^(?:documenta[cç][aã]o|docs?)\s+(?:oficial\s+)?(?:do|da|de)\s+/i,
      '',
    )
    .replace(/^(?:como\s+(?:fazer|usar|implementar|configurar)\s+)/i, '')
    .replace(/^(?:no|na|em|com)\s+/i, '')
    .trim();

  if (technology) {
    const techNorm = normalize(technology);
    for (const alias of [technology, ...TECH_DOC_SOURCES.flatMap((s) => s.aliases)]) {
      const re = new RegExp(`\\b${normalize(alias).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      topic = topic.replace(re, '').trim();
    }
    if (!topic) topic = text.trim();
  }

  return topic.replace(/^(?:sobre|sobre o|sobre a|acerca de)\s+/i, '').trim() || text.trim();
}

/** Indica se o texto pede busca em documentação técnica oficial. */
export function isTechDocsRequest(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    /documenta[cç][aã]o|docs?\s+oficial/i.test(lower)
    || /(?:busca|busque|pesquis|consulte|encontre).*(?:documenta[cç][aã]o|docs?)/i.test(lower)
    || /como\s+(?:fazer|usar|implementar|configurar).*(?:no|na|em|com)\s+(?:nest|nestjs|python|dotnet|\.net|c#|react|next)/i.test(lower)
    || /(?:nest|nestjs|python|dotnet|react|nextjs|typescript|docker|kubernetes)\s+(?:docs?|documenta)/i.test(lower)
  );
}
