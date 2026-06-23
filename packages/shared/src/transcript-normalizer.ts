/** Segmento reconhecido pelo Web Speech API (pt-BR). */
export interface TranscriptSegment {
  text: string;
  isFinal: boolean;
}

/** Palavras comuns sem acento → forma correta em pt-BR. */
const ACCENT_MAP: Readonly<Record<string, string>> = {
  voce: 'você',
  nao: 'não',
  tambem: 'também',
  ja: 'já',
  ate: 'até',
  so: 'só',
  la: 'lá',
  ca: 'cá',
  entao: 'então',
  proximo: 'próximo',
  ultimo: 'último',
  numero: 'número',
  codigo: 'código',
  aplicacao: 'aplicação',
  informacao: 'informação',
  configuracao: 'configuração',
  documentacao: 'documentação',
  funcao: 'função',
  opcao: 'opção',
  versao: 'versão',
  sessao: 'sessão',
  conexao: 'conexão',
  autenticacao: 'autenticação',
  administracao: 'administração',
  usuario: 'usuário',
  servico: 'serviço',
  estara: 'estará',
  sera: 'será',
  atraves: 'através',
  alem: 'além',
  ninguem: 'ninguém',
  alguem: 'alguém',
  possivel: 'possível',
  impossivel: 'impossível',
  disponivel: 'disponível',
  indisponivel: 'indisponível',
  necessario: 'necessário',
  necessaria: 'necessária',
  facil: 'fácil',
  dificil: 'difícil',
  rapido: 'rápido',
  inteligencia: 'inteligência',
  programacao: 'programação',
  otimo: 'ótimo',
  incrivel: 'incrível',
  parabens: 'parabéns',
};

/** Correções contextuais típicas do STT em pt-BR. */
const PHRASE_CORRECTIONS: ReadonlyArray<[RegExp, string]> = [
  [/\bpor\s+exemplo\b/gi, 'por exemplo'],
  [/\ba\s+por\s+exemplo\b/gi, 'AI, por exemplo'],
  [/\bmodelo\s+de\s+a\b/gi, 'modelo de AI'],
  [/\bmodelo\s+de\s+ya\b/gi, 'modelo de IA'],
  [/\bcom\s+alguma\s+ya\b/gi, 'com alguma IA'],
  [/\bcom\s+alguma\s+a\b/gi, 'com alguma IA'],
  [/\bcom\s+algum\s+ya\b/gi, 'com algum IA'],
  [/\bjarvis\b/gi, 'JARVIS'],
  [/\bollama\b/gi, 'Ollama'],
  [/\bnestjs\b/gi, 'NestJS'],
  [/\bnextjs\b/gi, 'Next.js'],
  [/\btypescript\b/gi, 'TypeScript'],
  [/\bjavascript\b/gi, 'JavaScript'],
  [/\bdocker\b/gi, 'Docker'],
  [/\bgithub\b/gi, 'GitHub'],
  [/\byoutube\b/gi, 'YouTube'],
  [/\bspotify\b/gi, 'Spotify'],
  [/\bwhatsapp\b/gi, 'WhatsApp'],
  [/\bopen\s*ai\b/gi, 'OpenAI'],
  [/\bgpt\b/gi, 'GPT'],
  [/\bchat\s*gpt\b/gi, 'ChatGPT'],
  [/\bclaude\b/gi, 'Claude'],
  [/\bgemini\b/gi, 'Gemini'],
  [/\bmistral\b/gi, 'Mistral'],
  [/\bllama\b/gi, 'Llama'],
];

const QUESTION_STARTERS =
  /^(como|qual|quais|quando|onde|quem|por\s*que|porque|será|sera|voce|você|pode|podemos|consegue|consegues|tem|têm|há|ha|existe|existem|sabe|sabes|seria|seriam|andou|andei|fizeste|fez|fiz|está|esta|estao|estão|ja|já|deixa|deixe)\b/i;

const QUESTION_TRIGGERS =
  /\b(deixa\s+(eu|me)\s+te\s+perguntar|me\s+diga|me\s+fala|me\s+fale|será\s+que|sera\s+que|voce\s+sabe|você\s+sabe|sabe\s+me\s+dizer|pode\s+me\s+dizer|consegue\s+me\s+dizer)\b/i;

const EXCLAMATION_STARTERS =
  /^(nossa|caramba|uau|wow|incrivel|incrível|parabens|parabéns|obrigado|obrigada|valeu|show|top|excelente|perfeito|otimo|ótimo|maravilha)\b/i;

const GREETING_PATTERN =
  /^(bom\s+dia|boa\s+tarde|boa\s+noite|olá|ola|oi|hey|e\s+aí|eai|salve)\b/i;

/** Extrai segmentos do evento Web Speech API. */
export function extractTranscriptSegments(
  results: { length: number; [index: number]: { isFinal: boolean; length: number; 0: { transcript: string } } },
): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  for (let i = 0; i < results.length; i++) {
    const chunk = results[i][0]?.transcript?.trim();
    if (chunk) {
      segments.push({ text: chunk, isFinal: results[i].isFinal });
    }
  }
  return segments;
}

/** Junta segmentos com espaço; vírgula entre blocos finais consecutivos (pausas naturais). */
export function joinTranscriptSegments(segments: TranscriptSegment[]): string {
  if (!segments.length) return '';

  let raw = '';
  for (let i = 0; i < segments.length; i++) {
    const { text, isFinal } = segments[i];
    if (!text) continue;

    if (!raw) {
      raw = text;
      continue;
    }

    const needsComma =
      isFinal &&
      segments[i - 1]?.isFinal &&
      !/[,.!?;:]$/.test(raw.trim()) &&
      text.length > 2;

    raw += needsComma ? `, ${text}` : ` ${text}`;
  }

  return raw.trim();
}

function restoreAccents(text: string): string {
  return text.replace(/\b[\p{L}]+\b/gu, (word) => {
    const lower = word.toLowerCase();
    const fixed = ACCENT_MAP[lower];
    if (!fixed) return word;
    if (word === word.toUpperCase()) return fixed.toUpperCase();
    if (word[0] === word[0].toUpperCase()) {
      return fixed.charAt(0).toUpperCase() + fixed.slice(1);
    }
    return fixed;
  });
}

function applyPhraseCorrections(text: string): string {
  let result = text;
  for (const [pattern, replacement] of PHRASE_CORRECTIONS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function capitalizeSentences(text: string): string {
  return text.replace(/(^|[.!?]\s+)([\p{Ll}])/gu, (_, prefix: string, letter: string) => {
    return `${prefix}${letter.toUpperCase()}`;
  });
}

function insertGreetingComma(text: string): string {
  return text.replace(
    /^(bom\s+dia|boa\s+tarde|boa\s+noite|olá|ola|oi|hey|e\s+aí|eai|salve)\b(\s+)/i,
    (_, greeting: string, space: string) => `${greeting},${space}`,
  );
}

function insertQuestionColon(text: string): string {
  return text.replace(
    /\b(deixa\s+(?:eu|me)\s+te\s+perguntar|me\s+diga|me\s+fala|me\s+fale)\b(\s+)/i,
    (_, trigger: string, space: string) => `${trigger}:${space}`,
  );
}

function resolveEndPunctuation(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  if (/[.!?…]$/.test(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  if (QUESTION_TRIGGERS.test(lower) || QUESTION_STARTERS.test(lower)) {
    return `${trimmed}?`;
  }
  if (EXCLAMATION_STARTERS.test(lower)) {
    return `${trimmed}!`;
  }
  if (GREETING_PATTERN.test(lower) && trimmed.split(/\s+/).length <= 4) {
    return `${trimmed}.`;
  }

  return `${trimmed}.`;
}

/**
 * Normaliza transcrição de voz (Web Speech API) para pt-BR escrito:
 * acentuação, vírgulas naturais, pontuação final e correções STT comuns.
 */
export function normalizePortugueseTranscript(
  raw: string,
  segments?: TranscriptSegment[],
): string {
  const base = segments?.length ? joinTranscriptSegments(segments) : raw;
  if (!base.trim()) return '';

  let text = collapseWhitespace(base);
  text = applyPhraseCorrections(text);
  text = restoreAccents(text);
  text = insertGreetingComma(text);
  text = insertQuestionColon(text);
  text = capitalizeFirst(text);
  text = capitalizeSentences(text);
  text = resolveEndPunctuation(text);

  return text;
}
