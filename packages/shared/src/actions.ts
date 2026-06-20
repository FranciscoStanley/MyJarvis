import { SearchResult } from './types';

export type ClientActionType = 'open_url' | 'open_app' | 'play_embed';

export type ClientApp = 'youtube' | 'spotify' | 'gmail' | 'browser' | 'cursor' | 'vscode';

export interface ClientAction {
  id: string;
  type: ClientActionType;
  label: string;
  description: string;
  url: string;
  app?: ClientApp;
  requiresConfirmation: boolean;
}

export type ConfirmationIntent = 'yes' | 'no' | 'none';

const YES_PATTERNS =
  /^(sim|s|yes|y|claro|pode|pode ser|com certeza|por favor|ok|okay|confirmo|vai|manda ver|isso|exato|correto|affirmative|positivo)(?:[,.!?\s]|$)/i;

const NO_PATTERNS =
  /^(n[aã]o|nao|n|no|negativo|cancela|cancelar|deixa|esquece|nunca mind|não precisa|nao precisa|dispensa|pare)(?:[,.!?\s]|$)/i;

/** Detecta confirmação ou negação curta do usuário (ex.: "sim", "não, obrigado"). */
export function detectConfirmationIntent(text: string): ConfirmationIntent {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return 'none';
  if (NO_PATTERNS.test(normalized)) return 'no';
  if (YES_PATTERNS.test(normalized)) return 'yes';
  return 'none';
}

/** Extrai ações pendentes do metadata da última mensagem do assistente. */
export function getPendingClientActions(
  messages: { role: string; metadata?: Record<string, unknown> }[],
): ClientAction[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role !== 'assistant') continue;
    const pending = msg.metadata?.pendingClientActions;
    if (Array.isArray(pending) && pending.length) {
      return pending as ClientAction[];
    }
  }
  return [];
}

/** Monta URL de busca no Spotify (sem API paga). */
export function buildSpotifySearchUrl(query: string): string {
  return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
}

/** Monta URL de busca no Google (sem API paga). */
export function buildGoogleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/** Monta URL de busca no YouTube (sem API paga). */
export function buildYoutubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

/** Monta URL do Gmail. */
export function buildGmailUrl(): string {
  return 'https://mail.google.com';
}

/** Monta deep link do Cursor IDE. */
export function buildCursorUrl(): string {
  return 'cursor://file/';
}

/** Monta deep link do VS Code. */
export function buildVscodeUrl(): string {
  return 'vscode://file/';
}

/** Verifica se a URL é do YouTube. */
export function isYoutubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}

export interface BuildClientActionsInput {
  searchResults: SearchResult[];
  actionTypes: string[];
  userMessage: string;
}
