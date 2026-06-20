/** Comando imperativo explícito — executar sem pedir confirmação extra. */
export function isExplicitExecuteCommand(text: string): boolean {
  const t = text.trim();
  return (
    /^(?:abre|abra|abrir|open|toque|coloque|reproduz|reproduza|play|ponha|entra|entre|vá|va|acesse|faça|faz)\b/i.test(t)
    || /\b(?:preciso que|quero que|faça exatamente|você não abriu|nao abriu|não abriu)\b/i.test(t)
  );
}

/** Gera resposta quando o LLM retorna tool_calls sem texto. */
export function buildActionAcknowledgement(
  actions: { type: string; query?: string }[],
  userMessage: string,
): string {
  const withQuery = actions.find((a) => a.query);
  const query = withQuery?.query ?? userMessage.trim();

  if (actions.some((a) => ['video', 'music'].includes(a.type))) {
    return `Certamente, senhor. Localizando «${query}» para reproduzir.`;
  }
  if (actions.some((a) => a.type === 'search')) {
    return `Senhor, pesquisando «${query}» agora.`;
  }
  if (actions.some((a) => a.type === 'open_url' || a.type === 'open_app')) {
    return 'À sua disposição, senhor. Abrindo conforme solicitado.';
  }
  return 'Certamente, senhor. Processando sua solicitação.';
}
