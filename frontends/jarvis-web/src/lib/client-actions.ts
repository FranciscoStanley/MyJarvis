import type { ClientAction } from '@myjarvis/shared';

/** Executa uma ação no dispositivo do usuário (navegador/PWA). */
export function executeClientAction(action: ClientAction): boolean {
  if (!action.url && action.type !== 'play_embed') return false;

  switch (action.type) {
    case 'open_url':
    case 'open_app':
      window.open(action.url, '_blank', 'noopener,noreferrer');
      return true;
    case 'play_embed':
      return true;
    default:
      return false;
  }
}

/** Executa todas as ações confirmadas. Retorna URLs de embed para reprodução inline. */
export function executeClientActions(actions: ClientAction[]): {
  executed: ClientAction[];
  embedUrl: string | null;
} {
  let embedUrl: string | null = null;
  const executed: ClientAction[] = [];

  for (const action of actions) {
    if (action.requiresConfirmation) continue;

    if (action.type === 'play_embed') {
      embedUrl = action.url;
      executed.push(action);
    } else if (executeClientAction(action)) {
      executed.push(action);
    }
  }

  return { executed, embedUrl };
}

/** Remove URLs e blocos técnicos antes de falar (TTS). */
export function stripTextForSpeech(text: string): string {
  return text
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\n\nDeseja que eu .+$/s, '')
    .replace(/\n\nPosso .+senhor\?$/s, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
