import { DOC_REGISTRY, DocRegistryEntry } from '../constants/doc-registry';

export interface DocSearchInput {
  technology: string;
  topic: string;
}

/** Resolve tecnologia mencionada pelo usuário para entrada do registro de docs. */
export function resolveDocEntry(technology: string): DocRegistryEntry | null {
  const normalized = technology.toLowerCase().trim().replace(/\s+/g, '');
  if (!normalized) return null;

  return DOC_REGISTRY.find((entry) =>
    entry.id === normalized
    || entry.aliases.some((alias) => normalized.includes(alias.replace(/\s+/g, ''))
      || alias.replace(/\s+/g, '') === normalized),
  ) ?? null;
}

/** Monta query otimizada para buscar na documentação oficial (DuckDuckGo site:). */
export function buildDocSearchQuery(input: DocSearchInput): string {
  const topic = input.topic.trim();
  const entry = resolveDocEntry(input.technology);

  if (entry) {
    return `site:${entry.domain} ${topic}`.trim();
  }

  const tech = input.technology.trim();
  return `${tech} official documentation ${topic}`.trim();
}

/** Detecta tecnologia em texto livre do usuário. */
export function detectTechnologyFromText(text: string): string | null {
  const lower = text.toLowerCase();

  for (const entry of DOC_REGISTRY) {
    for (const alias of entry.aliases) {
      const pattern = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (pattern.test(lower)) return entry.name;
    }
  }

  return null;
}

/** Extrai tópico de busca em pedidos de documentação. */
export function extractDocTopic(text: string, technology?: string | null): string {
  let topic = text
    .replace(/^(?:jarvis,?\s*)/i, '')
    .replace(
      /^(?:busca|busque|pesquise|procure|encontre|consulte|veja|olhe)\s+(?:na|no|em)\s+(?:documenta[cç][aã]o\s+)?(?:oficial\s+)?(?:do|da|de)\s+/i,
      '',
    )
    .replace(/^(?:como\s+(?:usar|configurar|implementar|fazer))\s+/i, '')
    .replace(/^(?:documenta[cç][aã]o|docs?)\s+(?:do|da|de)\s+/i, '')
    .replace(/^(?:preciso\s+(?:de|saber|entender)\s+)/i, '')
    .trim();

  if (technology) {
    for (const alias of [technology, technology.toLowerCase()]) {
      topic = topic.replace(new RegExp(`\\b${alias}\\b`, 'gi'), '').trim();
    }
    const entry = resolveDocEntry(technology);
    if (entry) {
      for (const alias of entry.aliases) {
        topic = topic.replace(new RegExp(`\\b${alias}\\b`, 'gi'), '').trim();
      }
    }
  }

  topic = topic.replace(/^(?:sobre|acerca de|a respeito de)\s+/i, '').trim();
  return topic || text.trim();
}

/** Indica se o texto pede busca em documentação técnica oficial. */
export function isDocumentationRequest(text: string): boolean {
  const lower = text.toLowerCase();
  const hasDocIntent = /documenta[cç][aã]o|docs?\s+(?:do|da|de|oficial)|official\s+docs?|manual\s+(?:do|da|de)|refer[eê]ncia\s+(?:do|da|de)/i.test(lower);
  const hasTech = detectTechnologyFromText(text) !== null;
  const hasHowTo = /(?:como\s+(?:usar|configurar|implementar|fazer|criar))|guia\s+(?:de|para)|tutorial/i.test(lower);

  return hasDocIntent || (hasTech && hasHowTo);
}
