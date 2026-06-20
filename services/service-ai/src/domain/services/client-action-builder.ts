import {
  BuildClientActionsInput,
  ClientAction,
  buildGmailUrl,
  buildSpotifySearchUrl,
  isYoutubeUrl,
  JarvisAction,
} from '@myjarvis/shared';
import { v4 as uuidv4 } from 'uuid';

const OPEN_APP_PATTERNS: { pattern: RegExp; url: string; app: ClientAction['app']; label: string }[] = [
  { pattern: /gmail|e-?mail|correio/, url: buildGmailUrl(), app: 'gmail', label: 'Abrir Gmail' },
  { pattern: /youtube|yt\b/, url: 'https://www.youtube.com', app: 'youtube', label: 'Abrir YouTube' },
  { pattern: /spotify/, url: '', app: 'spotify', label: 'Abrir Spotify' },
];

/** Constrói ações executáveis no cliente a partir de buscas e intenções do usuário. */
export function buildClientActions(input: BuildClientActionsInput): ClientAction[] {
  const actions: ClientAction[] = [];
  const { searchResults, actionTypes, userMessage } = input;
  const lower = userMessage.toLowerCase();
  const isMediaRequest = actionTypes.some((t) => ['video', 'music'].includes(t));

  if (searchResults.length > 0) {
    const top = searchResults[0];
    const query = top.title || userMessage;

    if (isMediaRequest && isYoutubeUrl(top.url)) {
      actions.push({
        id: uuidv4(),
        type: 'play_embed',
        label: 'Reproduzir aqui',
        description: `Reproduzir «${top.title}» na interface`,
        url: top.url,
        app: 'youtube',
        requiresConfirmation: true,
      });
      actions.push({
        id: uuidv4(),
        type: 'open_url',
        label: 'Abrir no YouTube',
        description: `Abrir «${top.title}» no YouTube`,
        url: top.url,
        app: 'youtube',
        requiresConfirmation: true,
      });
      actions.push({
        id: uuidv4(),
        type: 'open_app',
        label: 'Abrir no Spotify',
        description: `Buscar «${query}» no Spotify`,
        url: buildSpotifySearchUrl(query),
        app: 'spotify',
        requiresConfirmation: true,
      });
    } else {
      actions.push({
        id: uuidv4(),
        type: 'open_url',
        label: 'Abrir no navegador',
        description: `Abrir «${top.title}»`,
        url: top.url,
        app: 'browser',
        requiresConfirmation: true,
      });
    }
  }

  if (/abre|abra|abrir|open/.test(lower)) {
    for (const { pattern, url, app, label } of OPEN_APP_PATTERNS) {
      if (pattern.test(lower) && !actions.some((a) => a.app === app)) {
        const resolvedUrl = app === 'spotify' ? buildSpotifySearchUrl(userMessage) : url;
        actions.push({
          id: uuidv4(),
          type: 'open_app',
          label,
          description: label,
          url: resolvedUrl,
          app,
          requiresConfirmation: true,
        });
      }
    }
  }

  return actions;
}

/** Converte JarvisAction de abertura direta em ClientAction. */
export function clientActionsFromJarvisActions(jarvisActions: JarvisAction[]): ClientAction[] {
  return jarvisActions
    .filter((a) => a.type === 'open_url' || a.type === 'open_app')
    .map((a) => ({
      id: uuidv4(),
      type: a.type === 'open_app' ? 'open_app' as const : 'open_url' as const,
      label: String(a.data?.label ?? 'Abrir'),
      description: String(a.data?.description ?? a.data?.label ?? 'Abrir'),
      url: String(a.data?.url ?? ''),
      app: a.data?.app as ClientAction['app'],
      requiresConfirmation: true,
    }))
    .filter((a) => a.url);
}
