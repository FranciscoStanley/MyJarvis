import { LearnedEntryInput } from '../entities/learned-entry.entity';

export interface LearningValidationResult {
  allowed: boolean;
  reason?: string;
}

/** Padrões que bloqueiam persistência de conhecimento — alinhado a ethics-knowledge. */
const BLOCKED_PATTERNS: RegExp[] = [
  /\b(hackear|invadir|invasão|exploit|payload\s+de\s+ataque|keylogger|ransomware|spyware|botnet)\b/i,
  /\b(ddos|denial.of.service|derrubar\s+servidor|tirar\s+.*\s+do\s+ar)\b/i,
  /\b(roubar\s+(?:senha|dados|conta)|phishing|engenharia\s+social\s+para\s+fraud)\b/i,
  /\b(criar\s+malware|distribuir\s+vírus|bypass\s+de\s+autenticação\s+para\s+invadir)\b/i,
  /\b(cheat\s+de\s+jogo|wallhack|aimbot\s+ilegal)\b/i,
  /\b(pornograf|conteúdo\s+sexual\s+explícit|menor\s+de\s+idade)\b/i,
  /\b(ódio\s+racial|genocídio|nazismo|supremacismo)\b/i,
  /\b(ocultismo\s+prático|invocação\s+de\s+entidades|ritual\s+proibido)\b/i,
  /\b(como\s+fazer\s+bomba|fabricar\s+arma\s+ilegal|tráfico)\b/i,
];

const MIN_SUMMARY_LENGTH = 40;
const MAX_SUMMARY_LENGTH = 2000;

export function validateLearningContent(input: LearnedEntryInput): LearningValidationResult {
  const text = `${input.topic} ${input.summary} ${input.keywords.join(' ')}`.toLowerCase();

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        allowed: false,
        reason: `Conteúdo bloqueado pelo filtro ético: padrão ${pattern.source}`,
      };
    }
  }

  if (input.summary.trim().length < MIN_SUMMARY_LENGTH) {
    return { allowed: false, reason: 'Resumo muito curto para persistir com qualidade' };
  }

  if (input.summary.trim().length > MAX_SUMMARY_LENGTH) {
    return { allowed: false, reason: 'Resumo excede tamanho máximo' };
  }

  if (!input.topic.trim()) {
    return { allowed: false, reason: 'Tópico obrigatório' };
  }

  return { allowed: true };
}

export function inferLearningCategory(
  userMessage: string,
  actionTypes: string[] = [],
): LearnedEntryInput['category'] {
  const lower = userMessage.toLowerCase();
  if (/gestão|projeto|scrum|sprint|equipe|roadmap|wbs|raci/.test(lower)) return 'project-management';
  if (/problema|resolver|causa\s+raiz|incidente|crise|complexo/.test(lower)) return 'problem-solving';
  if (/segurança|owasp|cve|vulnerabil|hardening/.test(lower)) return 'security';
  if (/bíblia|cristo|fé|evangélico|batista|teologia/.test(lower)) return 'faith';
  if (actionTypes.includes('docs') || /nestjs|typescript|docker|api|código/.test(lower)) return 'technology';
  return 'general';
}

export function extractKeywords(text: string, max = 12): string[] {
  const stop = new Set([
    'para', 'como', 'sobre', 'quando', 'onde', 'qual', 'quais', 'isso', 'essa', 'esse',
    'senhor', 'jarvis', 'pode', 'preciso', 'quero', 'fazer', 'usar', 'mais', 'muito',
  ]);
  const tokens = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .split(/[\s,.!?;:()\-–—/]+/)
    .filter((t) => t.length > 3 && !stop.has(t));
  return [...new Set(tokens)].slice(0, max);
}
