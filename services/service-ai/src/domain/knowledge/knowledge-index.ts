import { ACTION_KNOWLEDGE_CHUNKS } from './action-knowledge';
import { DEV_KNOWLEDGE_CHUNKS } from './dev-knowledge';
import { ETHICS_KNOWLEDGE_CHUNKS } from './ethics-knowledge';

export type { KnowledgeChunk } from './action-knowledge';

/** Índice unificado da base RAG — ações + desenvolvimento + ética/segurança. */
export const ALL_KNOWLEDGE_CHUNKS = [
  ...ACTION_KNOWLEDGE_CHUNKS,
  ...DEV_KNOWLEDGE_CHUNKS,
  ...ETHICS_KNOWLEDGE_CHUNKS,
];

export const KNOWLEDGE_STATS = {
  actionChunks: ACTION_KNOWLEDGE_CHUNKS.length,
  devChunks: DEV_KNOWLEDGE_CHUNKS.length,
  ethicsChunks: ETHICS_KNOWLEDGE_CHUNKS.length,
  total: ALL_KNOWLEDGE_CHUNKS.length,
} as const;
