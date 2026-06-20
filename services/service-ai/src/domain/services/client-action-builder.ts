import {
  BuildClientActionsInput,
  ClientAction,
  buildGmailUrl,
  buildGoogleSearchUrl,
  buildSpotifySearchUrl,
  buildYoutubeSearchUrl,
  isYoutubeUrl,
  JarvisAction,
} from '@myjarvis/shared';
import { randomUUID } from 'crypto';
import { isExplicitExecuteCommand } from './action-intent';

const OPEN_APP_PATTERNS: { pattern: RegExp; url: string | ((q: string) => string); app: ClientAction['app']; label: string }[] = [
  { pattern: /gmail|e-?mail|correio/, url: buildGmailUrl(), app: 'gmail', label: 'Abrir Gmail' },
  { pattern: /youtube|yt\b/, url: 'https://www.youtube.com', app: 'youtube', label: 'Abrir YouTube' },
  { pattern: /spotify/, url: (q) => buildSpotifySearchUrl(q), app: 'spotify', label: 'Abrir Spotify' },
  { pattern: /\bcursor\b/, url: 'cursor://file/', app: 'cursor', label: 'Abrir Cursor' },
  { pattern: /vs\s*code|visual studio code/, url: 'vscode://file/', app: 'vscode', label: 'Abrir VS Code' },
];

function resolveUrl(entry: typeof OPEN_APP_PATTERNS[number], query: string): string {
  return typeof entry.url === 'function' ? entry.url(query) : entry.url;
}

function autoConfirm(explicit: boolean, primary = false): boolean {
  return explicit ? false : true;
}

/** Constrói ações executáveis no cliente a partir de buscas e intenções do usuário. */
export function buildClientActions(input: BuildClientActionsInput): ClientAction[] {
  const actions: ClientAction[] = [];
  const { searchResults, actionTypes, userMessage } = input;
  const lower = userMessage.toLowerCase();
  const explicit = isExplicitExecuteCommand(userMessage);
  const isMediaRequest = actionTypes.some((t) => ['video', 'music'].includes(t));

  if (searchResults.length > 0) {
    const top = searchResults[0];
    const query = top.title || userMessage;

    if (isMediaRequest && isYoutubeUrl(top.url)) {
      if (!explicit) {
        actions.push({
          id: randomUUID(),
          type: 'play_embed',
          label: 'Reproduzir aqui',
          description: `Reproduzir «${top.title}» na interface`,
          url: top.url,
          app: 'youtube',
          requiresConfirmation: true,
        });
      }
      actions.push({
        id: randomUUID(),
        type: 'open_url',
        label: 'Abrir no YouTube',
        description: `Abrir «${top.title}» no YouTube`,
        url: top.url,
        app: 'youtube',
        requiresConfirmation: autoConfirm(explicit, true),
      });
      if (!explicit) {
        actions.push({
          id: randomUUID(),
          type: 'open_app',
          label: 'Abrir no Spotify',
          description: `Buscar «${query}» no Spotify`,
          url: buildSpotifySearchUrl(query),
          app: 'spotify',
          requiresConfirmation: true,
        });
      }
    } else {
      actions.push({
        id: randomUUID(),
        type: 'open_url',
        label: 'Abrir no navegador',
        description: `Abrir «${top.title}»`,
        url: top.url,
        app: 'browser',
        requiresConfirmation: autoConfirm(explicit),
      });
    }
  }

  if (/abre|abra|abrir|open|entre|entrar|acesse|google chrome/.test(lower)) {
    if (/nova aba|aba (?:do )?navegador|aba em branco|new tab|navegador|browser|chrome/.test(lower)
        && !actions.some((a) => a.url === 'about:blank')) {
      actions.push({
        id: randomUUID(),
        type: 'open_url',
        label: 'Abrir nova aba',
        description: 'Abrir uma nova aba no navegador',
        url: 'about:blank',
        app: 'browser',
        requiresConfirmation: autoConfirm(explicit),
      });
    }
    if (/google/.test(lower) && /busca|pesquis|encontr/.test(lower)
        && !actions.some((a) => a.url.includes('google.com/search'))) {
      const q = userMessage.replace(/.*(?:busca|pesquis|encontr\w*)\s+/i, '').trim() || userMessage;
      actions.push({
        id: randomUUID(),
        type: 'open_url',
        label: 'Buscar no Google',
        description: `Buscar no Google`,
        url: buildGoogleSearchUrl(q),
        app: 'browser',
        requiresConfirmation: autoConfirm(explicit),
      });
    }
    for (const entry of OPEN_APP_PATTERNS) {
      if (entry.pattern.test(lower) && !actions.some((a) => a.app === entry.app)) {
        const q = userMessage.replace(/^(?:abre|abra|abrir)\s+(?:o\s+)?/i, '').trim();
        actions.push({
          id: randomUUID(),
          type: 'open_app',
          label: entry.label,
          description: entry.label,
          url: resolveUrl(entry, q),
          app: entry.app,
          requiresConfirmation: autoConfirm(explicit),
        });
      }
    }
  }

  if (explicit && isMediaRequest && !searchResults.length) {
    const q = userMessage.replace(/.*(?:m[uú]sica|musica|chamada)\s+/i, '').trim() || userMessage;
    actions.push({
      id: randomUUID(),
      type: 'open_url',
      label: 'Buscar no YouTube',
      description: `Buscar «${q}» no YouTube`,
      url: buildYoutubeSearchUrl(q),
      app: 'youtube',
      requiresConfirmation: false,
    });
  }

  return actions;
}

/** Converte JarvisAction de abertura direta em ClientAction. */
export function clientActionsFromJarvisActions(
  jarvisActions: JarvisAction[],
  userMessage = '',
): ClientAction[] {
  const explicit = isExplicitExecuteCommand(userMessage);

  return jarvisActions
    .filter((a) => a.type === 'open_url' || a.type === 'open_app')
    .map((a) => ({
      id: randomUUID(),
      type: a.type === 'open_app' ? 'open_app' as const : 'open_url' as const,
      label: String(a.data?.label ?? 'Abrir'),
      description: String(a.data?.description ?? a.data?.label ?? 'Abrir'),
      url: String(a.data?.url ?? ''),
      app: a.data?.app as ClientAction['app'],
      requiresConfirmation: explicit ? false : true,
    }))
    .filter((a) => a.url);
}
