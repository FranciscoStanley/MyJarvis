import { ClientAction, SearchResult } from '@myjarvis/shared';

const JARVIS_OPENERS = [
  'Senhor,',
  'Muito bem, senhor.',
  'À sua disposição, senhor.',
  'Certamente, senhor.',
];

function pickOpener(): string {
  return JARVIS_OPENERS[Math.floor(Math.random() * JARVIS_OPENERS.length)];
}

/** Monta pergunta de confirmação no estilo JARVIS para ações pendentes. */
export function buildConfirmationPrompt(clientActions: ClientAction[]): string {
  if (!clientActions.length) return '';

  const labels = [...new Set(clientActions.map((a) => a.label))];
  if (labels.length === 1) {
    return `\n\nDeseja que eu ${labels[0].toLowerCase()}?`;
  }

  const options = labels.slice(0, 3).join(', ');
  return `\n\nPosso ${options.toLowerCase()}. O que prefere, senhor?`;
}

/** Resposta quando o usuário confirma uma ação. */
export function buildConfirmedReply(action: ClientAction): string {
  const verbs: Record<string, string> = {
    play_embed: 'Iniciando a reprodução na interface',
    open_url: 'Abrindo no navegador',
    open_app: `Abrindo ${action.app ?? 'aplicativo'}`,
  };
  return `${pickOpener()} ${verbs[action.type] ?? 'Executando'} — ${action.description}.`;
}

/** Resposta quando o usuário recusa. */
export function buildDeclinedReply(): string {
  return `${pickOpener()} Como desejar. Permaneço à disposição para qualquer outra solicitação.`;
}

/** Fallback quando o LLM não sintetiza — resposta estruturada a partir dos resultados. */
export function synthesizeFallbackReply(
  userMessage: string,
  searchResults: SearchResult[],
  actionTypes: string[],
): string {
  if (!searchResults.length) {
    return `${pickOpener()} Não encontrei resultados relevantes para a sua solicitação. Posso tentar outra busca?`;
  }

  const top = searchResults[0];
  const isMedia = actionTypes.some((t) => ['video', 'music'].includes(t));

  if (isMedia) {
    const extra = searchResults[1] ? ` Outra opção seria «${searchResults[1].title}».` : '';
    return (
      `${pickOpener()} Localizei «${top.title}».` +
      (top.snippet ? ` ${top.snippet.slice(0, 120)}.` : '') +
      extra
    );
  }

  const summary = searchResults
    .slice(0, 3)
    .map((r, i) => `${i + 1}. ${r.title}${r.snippet ? ` — ${r.snippet.slice(0, 80)}` : ''}`)
    .join('\n');

  return `${pickOpener()} Encontrei o seguinte sobre «${userMessage.trim()}»:\n\n${summary}`;
}
