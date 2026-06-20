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

    if (this.rag) {
      try {
        const ragContext = await this.rag.retrieve(userMessage, 4);
        if (ragContext) {
          sections.push(`--- CONTEXTO RAG (capacidades e exemplos) ---\n${ragContext}`);
        }
      } catch {
        /* fallback */
      }
    }

    if (this.learning) {
      try {
        const learned = await this.learning.search(userMessage, 3);
        if (learned.length) {
          const block = learned
            .map((e, i) => `[L${i + 1}] (${e.category}) ${e.topic}\n${e.summary}`)
            .join('\n\n');
          sections.push(`--- CONHECIMENTO APRENDIDO (memória persistente) ---\n${block}`);
        }
      } catch {
        /* fallback */
      }
    }

    return sections.join('\n\n');
  }
}
