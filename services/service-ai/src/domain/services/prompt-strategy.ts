const EXTENDED_PROMPT_PATTERN =
  /\b(review|refator|refactor|blueprint|skill|rule|arquitetura|architecture|solid|nestjs|nextjs|swagger|ci\/cd|owasp|cve|projeto|sistema|aplica[cç][aã]o|docker|kubernetes|typescript|use case|clean architecture)\b/i;
const ACTION_INTENT_PATTERN =
  /\b(abra|abrir|open|toque|play|reproduza|busque|pesquise|procure|youtube|spotify|google|gmail|browser|cursor|vscode|docs?|documenta[cç][aã]o|manual|api)\b/i;

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
