import { Injectable, Inject, Optional } from '@nestjs/common';
import { RAG_PORT, RagPort } from '../../domain/ports/rag.port';
import { LEARNING_STORE, LearningStorePort } from '../../domain/ports/learning-store.port';

@Injectable()
export class ContextEnrichmentService {
  constructor(
    @Optional() @Inject(RAG_PORT) private readonly rag?: RagPort,
    @Optional() @Inject(LEARNING_STORE) private readonly learning?: LearningStorePort,
  ) {}

  async buildEnrichedContext(userMessage: string): Promise<string> {
    const sections: string[] = [];

    const [ragContext, learned] = await Promise.all([
      this.fetchRagContext(userMessage),
      this.fetchLearnedContext(userMessage),
    ]);

    if (ragContext) sections.push(ragContext);
    if (learned) sections.push(learned);

    return sections.join('\n\n');
  }

  private async fetchRagContext(userMessage: string): Promise<string> {
    if (!this.rag) return '';
    try {
      const ragContext = await this.rag.retrieve(userMessage, 3);
      if (ragContext) {
        return `--- CONTEXTO RAG (capacidades e exemplos) ---\n${ragContext}`;
      }
    } catch {
      /* fallback */
    }
    return '';
  }

  private async fetchLearnedContext(userMessage: string): Promise<string> {
    if (!this.learning) return '';
    try {
      const learned = await this.learning.search(userMessage, 2);
      if (learned.length) {
        const block = learned
          .map((e, i) => `[L${i + 1}] (${e.category}) ${e.topic}\n${e.summary}`)
          .join('\n\n');
        return `--- CONHECIMENTO APRENDIDO (memória persistente) ---\n${block}`;
      }
    } catch {
      /* fallback */
    }
    return '';
  }
}
