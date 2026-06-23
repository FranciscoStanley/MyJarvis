const EXTENDED_PROMPT_PATTERN =
  /\b(review|refator|refactor|blueprint|skill|rule|arquitetura|architecture|solid|nestjs|nextjs|swagger|ci\/cd|owasp|cve|projeto|sistema|aplic[cç][aã]o|docker|kubernetes|typescript|use case|clean architecture)\b/i;
const ACTION_INTENT_PATTERN =
  /\b(abra|abrir|open|toque|play|reproduza|busque|pesquise|procure|youtube|spotify|google|gmail|browser|cursor|vscode|docs?|documenta[cç][aã]o|manual|api)\b/i;
const SIMPLE_GREETING_PATTERN =
  /^(oi|olá|ola|hey|bom\s+dia|boa\s+tarde|boa\s+noite|obrigado|obrigada|valeu|tchau|até|ate)\b/i;

/** Instruções longas de dev agent — anexadas só quando a mensagem exige. */
export function needsExtendedPrompt(message: string): boolean {
  return EXTENDED_PROMPT_PATTERN.test(message);
}

/** Tool calling aumenta latência no Ollama CPU — omitir em conversas simples. */
export function shouldAttachTools(message: string): boolean {
  if (ACTION_INTENT_PATTERN.test(message)) return true;
  if (needsExtendedPrompt(message)) return true;
  return message.trim().length > 160;
}

/** RAG + memória aprendida — omitir em saudações e mensagens curtas (economiza embedding). */
export function shouldEnrichContext(message: string): boolean {
  const trimmed = message.trim();
  if (trimmed.length < 28) return false;
  if (SIMPLE_GREETING_PATTERN.test(trimmed) && trimmed.length < 72) return false;
  return true;
}

/** Opções Ollama ajustadas por complexidade da mensagem. */
export function buildOllamaChatOptions(message: string): Record<string, number> {
  const extended = needsExtendedPrompt(message);
  return {
    temperature: extended ? 0.85 : 0.78,
    num_predict: extended ? 384 : 128,
    num_ctx: extended ? 4096 : 2048,
  };
}
