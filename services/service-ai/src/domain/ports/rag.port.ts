export interface RagPort {
  /** Retorna contexto relevante para injetar no prompt do LLM. */
  retrieve(query: string, topK?: number): Promise<string>;

  /** Indica se o índice RAG está pronto (embeddings ou fallback keyword). */
  isReady(): boolean;
}

export const RAG_PORT = Symbol('RAG_PORT');
