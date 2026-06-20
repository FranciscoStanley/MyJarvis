/** Entrada de conhecimento adquirido dinamicamente — persistida após validação ética. */
export type LearnedEntryCategory =
  | 'technology'
  | 'security'
  | 'project-management'
  | 'problem-solving'
  | 'faith'
  | 'general';

export type LearnedEntrySource = 'web_search' | 'doc_search' | 'peer_ai' | 'conversation' | 'user_explicit';

export interface LearnedEntry {
  id: string;
  topic: string;
  summary: string;
  keywords: string[];
  category: LearnedEntryCategory;
  source: LearnedEntrySource;
  sourceQuery?: string;
  confidence: number;
  createdAt: string;
  lastUsedAt?: string;
  useCount: number;
}

export interface LearnedEntryInput {
  topic: string;
  summary: string;
  keywords: string[];
  category: LearnedEntryCategory;
  source: LearnedEntrySource;
  sourceQuery?: string;
  confidence?: number;
}
