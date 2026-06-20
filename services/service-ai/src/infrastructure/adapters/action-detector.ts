import { JarvisAction, buildGmailUrl, buildGoogleSearchUrl, buildSpotifySearchUrl, buildYoutubeSearchUrl } from '@myjarvis/shared';

/** Extrai o termo de busca de comandos em português como "busca no youtube a música Espírito Santo". */
export function extractSearchQuery(text: string): string {
  let query = text
    .replace(/^(jarvis,?\s*)/i, '')
    .replace(
      /^(?:abre|abra|abrir|open|entre|entrar|acesse|vá|va)\s+(?:o\s+)?(?:google\s+chrome\s+e\s+)?(?:no\s+)?(?:youtube|yt|google|web|internet|spotify)\s+(?:na\s+)?(?:m[uú]sica\s+)?(?:chamada\s+|de\s+|por\s+|com\s+)?/i,
      '',
    )
    .replace(
      /^(?:busca|pesquise|procure|abre|abra|toque|coloque|reproduza|play|ponha|coloca|encontre|encontrar)\s+(?:no\s+)?(?:google|youtube|yt|web|internet|spotify)\s+(?:a\s+|o\s+|os\s+|as\s+)?(?:m[uú]sica|video|v[ií]deo|can[cç][aã]o|som|clip|clipes?)\s+(?:chamada\s+|de\s+|do\s+|da\s+|por\s+)?/i,
      '',
    )
    .replace(
      /^(?:busca|pesquise|procure|toque|coloque|reproduza|play|ponha|coloca|encontre)\s+(?:a\s+|o\s+)?(?:m[uú]sica|video|v[ií]deo|can[cç][aã]o|som)\s+(?:chamada\s+|de\s+|do\s+|da\s+|por\s+)?/i,
      '',
    )
    .replace(/^(?:busca|pesquise|procure|encontre|encontrar)\s+(?:por\s+|no\s+google\s+)?/i, '')
    .replace(/\s+(?:o\s+)?nome da banda [ée]\s+/i, ' ')
    .replace(/\s+e\s+suas?\s+linhas?\s+de\s+\w+/i, '')
    .trim();

  if (!query) query = text.trim();
  return query;
}

/** Detecta ações a partir do texto do usuário quando o Ollama não retorna tool_calls. */
export function detectActionsFromText(text: string): JarvisAction[] {
  const lower = text.toLowerCase();
  const query = extractSearchQuery(text);

  if (/^(abre|abra|abrir|open|entre|entrar|acesse|vá para|va para)\s/.test(lower)
      || /\b(?:preciso que|quero que)\s+(?:abra|abrir|entre|entrar)\b/.test(lower)) {
    if (/nova aba|aba (?:do )?navegador|aba em branco|new tab|navegador em branco/.test(lower)) {
      return [{
        type: 'open_url',
        data: {
          url: 'about:blank',
          app: 'browser',
          label: 'Abrir nova aba',
          description: 'Abrir uma nova aba no navegador',
        },
      }];
    }
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
    if (/google/.test(lower) && /busca|pesquis|encontr/.test(lower) && query) {
      return [{
        type: 'open_url',
        data: {
          url: buildGoogleSearchUrl(query),
          app: 'browser',
          label: 'Buscar no Google',
          description: `Buscar «${query}» no Google`,
        },
      }];
    }
    if (/youtube|yt\b/.test(lower)) {
      if (query && /m[uú]sica|musica|video|v[ií]deo|chamada|tocar|banda/.test(lower)) {
        return [{ type: 'video', query }];
      }
      return [{
        type: 'open_app',
        data: {
          url: query ? buildYoutubeSearchUrl(query) : 'https://www.youtube.com',
          app: 'youtube',
          label: 'Abrir YouTube',
          description: query ? `Abrir YouTube — «${query}»` : 'Abrir YouTube',
        },
      }];
    }
    if (/navegador|browser|chrome|google chrome/.test(lower)) {
      return [{
        type: 'open_url',
        data: {
          url: 'about:blank',
          app: 'browser',
          label: 'Abrir navegador',
          description: 'Abrir nova aba no navegador',
        },
      }];
    }
  }

  if (/youtube|youtu\.be/.test(lower)) {
    if (/m[uú]sica|musica|video|v[ií]deo|tocar|som|coloque|reproduz|play|ponha|busca|pesquis|chamada|banda/.test(lower)) {
      return [{ type: 'video', query }];
    }
  }

  if (/google/.test(lower) && /busca|busque|pesquis|encontr|procure/.test(lower)) {
    return [{ type: 'search', query }];
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
