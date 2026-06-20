import { ACTION_KNOWLEDGE_CHUNKS } from './action-knowledge';
import { DEV_KNOWLEDGE_CHUNKS } from './dev-knowledge';
import { ETHICS_KNOWLEDGE_CHUNKS } from './ethics-knowledge';
import { FAITH_KNOWLEDGE_CHUNKS } from './faith-knowledge';
import { PM_KNOWLEDGE_CHUNKS } from './pm-knowledge';

export type { KnowledgeChunk } from './action-knowledge';

/** Índice unificado da base RAG — ações + dev + ética + fé + gestão/aprendizado. */
export const ALL_KNOWLEDGE_CHUNKS = [
  ...ACTION_KNOWLEDGE_CHUNKS,
  ...DEV_KNOWLEDGE_CHUNKS,
  ...ETHICS_KNOWLEDGE_CHUNKS,
  ...FAITH_KNOWLEDGE_CHUNKS,
  ...PM_KNOWLEDGE_CHUNKS,
];

export const KNOWLEDGE_STATS = {
  actionChunks: ACTION_KNOWLEDGE_CHUNKS.length,
  devChunks: DEV_KNOWLEDGE_CHUNKS.length,
  ethicsChunks: ETHICS_KNOWLEDGE_CHUNKS.length,
  faithChunks: FAITH_KNOWLEDGE_CHUNKS.length,
  pmChunks: PM_KNOWLEDGE_CHUNKS.length,
  total: ALL_KNOWLEDGE_CHUNKS.length,
} as const;
