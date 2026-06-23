import { ChatMessage } from '@myjarvis/shared';
import { isDevConversation, isFollowUpMessage } from './conversation-context';

const EXTENDED_PROMPT_PATTERN =
  /\b(review|refator|refactor|blueprint|skill|rule|arquitetura|architecture|solid|nestjs|nextjs|next\.js|swagger|ci\/cd|owasp|cve|projeto|sistema|aplic[cç][aã]o|docker|kubernetes|typescript|use case|clean architecture|fullstack|full stack|código|codigo|implement|scaffold|backend|frontend|módulo|modulo|componente|arquivo|pasta|estrutura)\b/i;
const ACTION_INTENT_PATTERN =
  /\b(abra|abrir|open|toque|play|reproduza|busque|pesquise|procure|youtube|spotify|google|gmail|browser|cursor|vscode|docs?|documenta[cç][aã]o|manual|api)\b/i;
const SIMPLE_GREETING_PATTERN =
  /^(oi|olá|ola|hey|bom\s+dia|boa\s+tarde|boa\s+noite|obrigado|obrigada|valeu|tchau|até|ate)\b/i;

/** Instruções longas de dev agent — anexadas quando a mensagem ou histórico exige. */
export function needsExtendedPrompt(message: string, history: ChatMessage[] = []): boolean {
  if (EXTENDED_PROMPT_PATTERN.test(message)) return true;
  if (isDevConversation(message, history)) return true;
  if (isFollowUpMessage(message, history) && isDevConversation('', history)) return true;
  return false;
}

/** Tool calling aumenta latência no Ollama CPU — omitir em conversas simples. */
export function shouldAttachTools(message: string, history: ChatMessage[] = []): boolean {
  if (ACTION_INTENT_PATTERN.test(message)) return true;
  if (needsExtendedPrompt(message, history)) return true;
  if (isFollowUpMessage(message, history) && history.length >= 2) return false;
  return message.trim().length > 160;
}

/** RAG + memória aprendida — omitir em saudações e mensagens curtas (economiza embedding). */
export function shouldEnrichContext(message: string, history: ChatMessage[] = []): boolean {
  const trimmed = message.trim();
  if (isFollowUpMessage(trimmed, history)) return true;
  if (trimmed.length < 28) return false;
  if (SIMPLE_GREETING_PATTERN.test(trimmed) && trimmed.length < 72) return false;
  return true;
}

/** Opções Ollama ajustadas por complexidade da mensagem e histórico. */
export function buildOllamaChatOptions(
  message: string,
  history: ChatMessage[] = [],
): Record<string, number> {
  const extended = needsExtendedPrompt(message, history);
  const devMode = isDevConversation(message, history);

  return {
    temperature: extended ? 0.72 : 0.78,
    num_predict: devMode ? 4096 : extended ? 1536 : 512,
    num_ctx: devMode ? 8192 : extended ? 6144 : 3072,
  };
}
