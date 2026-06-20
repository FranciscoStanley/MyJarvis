import { JarvisAction, buildGmailUrl, buildSpotifySearchUrl } from '@myjarvis/shared';

/** Extrai o termo de busca de comandos em português como "busca no youtube a música Espírito Santo". */
export function extractSearchQuery(text: string): string {
  let query = text
    .replace(/^(jarvis,?\s*)/i, '')
    .replace(
      /^(?:busca|pesquise|procure|abre|abra|toque|coloque|reproduza|play|ponha|coloca)\s+(?:no\s+)?(?:youtube|yt|web|internet|spotify)\s+(?:a\s+|o\s+|os\s+|as\s+)?(?:m[uú]sica|video|v[ií]deo|can[cç][aã]o|som|clip|clipes?)\s+(?:de\s+|do\s+|da\s+)?/i,
      '',
    )
    .replace(
      /^(?:busca|pesquise|procure|toque|coloque|reproduza|play|ponha|coloca)\s+(?:a\s+|o\s+)?(?:m[uú]sica|video|v[ií]deo|can[cç][aã]o|som)\s+(?:de\s+|do\s+|da\s+)?/i,
      '',
    )
    .replace(/^(?:busca|pesquise|procure)\s+(?:por\s+)?/i, '')
    .trim();

  if (!query) query = text.trim();
  return query;
}

/** Detecta ações a partir do texto do usuário quando o Ollama não retorna tool_calls. */
export function detectActionsFromText(text: string): JarvisAction[] {
  const lower = text.toLowerCase();
  const query = extractSearchQuery(text);

  if (/^(abre|abra|abrir|open)\s/.test(lower)) {
    if (/gmail|e-?mail|correio/.test(lower)) {
      return [{
        type: 'open_app',
        data: { url: buildGmailUrl(), app: 'gmail', label: 'Abrir Gmail', description: 'Abrir Gmail' },
      }];
    }
    if (/spotify/.test(lower)) {
      return [{
        type: 'open_app',
        data: {
          url: buildSpotifySearchUrl(query || 'música'),
          app: 'spotify',
          label: 'Abrir Spotify',
          description: 'Abrir Spotify',
        },
      }];
    }
    if (/youtube|yt\b/.test(lower) && !query) {
      return [{
        type: 'open_app',
        data: { url: 'https://www.youtube.com', app: 'youtube', label: 'Abrir YouTube', description: 'Abrir YouTube' },
      }];
    }
  }

  if (/youtube|youtu\.be/.test(lower)) {
    if (/m[uú]sica|musica|video|v[ií]deo|tocar|som|coloque|reproduz|play|ponha|busca|pesquis/.test(lower)) {
      return [{ type: 'video', query }];
    }
  }

  if (/m[uú]sica|musica|som|tocar|playlist|coloque.*m[uú]sica|ponha.*m[uú]sica|reproduz/.test(lower)) {
    return [{ type: 'video', query }];
  }

  if (/v[ií]deo|video|clip|clipes?/.test(lower)) {
    return [{ type: 'video', query }];
  }

  if (/imagem|foto|picture/.test(lower)) {
    return [{ type: 'image', query }];
  }

  if (/busca|pesquis|not[ií]cia|informa[cç]|internet|web/.test(lower)) {
    return [{ type: 'search', query }];
  }

  return [];
}
