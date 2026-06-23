import { ChatMessage } from '@myjarvis/shared';

const DEV_TOPIC_PATTERN =
  /\b(código|codigo|projeto|fullstack|full stack|nestjs|next\.?js|typescript|arquitetura|clean architecture|refator|implement|criar|scaffold|api|backend|frontend|docker|teste|vitest|swagger|módulo|modulo|componente|use case|repository|entity|dto|controller|service)\b/i;

const FOLLOW_UP_PATTERN =
  /\b(cont[eê]|detalh|explique|continue|prossiga|mais sobre|fale mais|elabor|aprofund|como ficou|e (sobre|quanto)|o que (mais|aprendeu)|me (conte|fale|explique)|pode (detalhar|continuar|explicar))\b/i;

const EXPLICIT_SEARCH_PATTERN =
  /\b(busque|pesquise|procure|search|google|youtube|spotify|imagem|vídeo|video|música|musica|notícias|noticias|tempo hoje|clima)\b/i;

const DEFAULT_HISTORY_WINDOW = 24;
const MAX_HISTORY_CHARS = 12_000;

/** Mensagem curta que continua o tópico anterior sem novo pedido de busca. */
export function isFollowUpMessage(message: string, history: ChatMessage[]): boolean {
  const trimmed = message.trim();
  if (history.length < 2) return false;
  if (EXPLICIT_SEARCH_PATTERN.test(trimmed)) return false;
  if (FOLLOW_UP_PATTERN.test(trimmed)) return true;
  return trimmed.length <= 140 && history.length >= 4;
}

/** Conversa técnica/de desenvolvimento — exige prompt estendido e mais tokens. */
export function isDevConversation(message: string, history: ChatMessage[]): boolean {
  if (DEV_TOPIC_PATTERN.test(message)) return true;
  const recent = history.slice(-8);
  return recent.some((m) => DEV_TOPIC_PATTERN.test(m.content));
}

/** Evita substituir resposta contextual por síntese de busca em follow-ups. */
export function shouldPreserveContextualReply(
  userMessage: string,
  history: ChatMessage[],
  reply: string,
  actionTypes: string[],
): boolean {
  if (!reply.trim()) return false;
  if (!isFollowUpMessage(userMessage, history)) return false;
  if (EXPLICIT_SEARCH_PATTERN.test(userMessage)) return false;
  const searchOnly = actionTypes.every((t) => t === 'search' || t === 'peer_ai' || t === 'docs');
  return searchOnly || actionTypes.includes('peer_ai');
}

/** Janela deslizante de histórico para caber no contexto do Ollama. */
export function trimHistoryForModel(
  messages: ChatMessage[],
  maxMessages = DEFAULT_HISTORY_WINDOW,
): ChatMessage[] {
  if (messages.length <= maxMessages) {
    return trimByCharBudget(messages);
  }
  return trimByCharBudget(messages.slice(-maxMessages));
}

function trimByCharBudget(messages: ChatMessage[]): ChatMessage[] {
  let total = 0;
  const kept: ChatMessage[] = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const len = messages[i].content.length;
    if (total + len > MAX_HISTORY_CHARS && kept.length >= 4) break;
    kept.unshift(messages[i]);
    total += len;
  }
  return kept;
}

/** Resumo compacto do tópico ativo para reforçar continuidade. */
export function buildConversationTopicSummary(history: ChatMessage[]): string {
  const recent = history.slice(-6);
  if (!recent.length) return '';

  const lines = recent.map((m) => {
    const role = m.role === 'user' ? 'Usuário' : 'JARVIS';
    const excerpt = m.content.replace(/\s+/g, ' ').trim().slice(0, 220);
    return `- ${role}: ${excerpt}${m.content.length > 220 ? '…' : ''}`;
  });

  return `CONTINUIDADE DA CONVERSA (mantenha o mesmo assunto e referências):
${lines.join('\n')}

REGRAS DE CONTINUIDADE:
- Responda diretamente ao pedido atual SEM mudar de assunto.
- Referencie o que já foi discutido quando o usuário pedir "mais detalhes", "continue" ou similares.
- Não reinicie explicações genéricas se o usuário pediu aprofundamento.`;
}
