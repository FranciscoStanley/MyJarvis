import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ACTION_KNOWLEDGE_CHUNKS, KnowledgeChunk } from '../../domain/knowledge/action-knowledge';
import { RagPort } from '../../domain/ports/rag.port';

interface IndexedChunk extends KnowledgeChunk {
  embedding: number[] | null;
}

@Injectable()
export class OllamaRagAdapter implements RagPort, OnModuleInit {
  private readonly logger = new Logger(OllamaRagAdapter.name);
  private readonly baseUrl: string;
  private readonly embedModel: string;
  private indexed: IndexedChunk[] = [];
  private embeddingsAvailable = false;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl = config.get('OLLAMA_BASE_URL', 'http://localhost:11434');
    this.embedModel = config.get('OLLAMA_EMBED_MODEL', 'nomic-embed-text');
  }

  onModuleInit() {
    void this.buildIndex();
  }

  isReady(): boolean {
    return this.indexed.length > 0;
  }

  async retrieve(query: string, topK = 3): Promise<string> {
    if (!this.indexed.length) await this.buildIndex();

    const ranked = this.embeddingsAvailable
      ? await this.retrieveByEmbedding(query, topK)
      : this.retrieveByKeywords(query, topK);

    if (!ranked.length) return '';

    return ranked
      .map((c, i) => `[${i + 1}] ${c.content}`)
      .join('\n\n');
  }

  private async buildIndex() {
    this.indexed = ACTION_KNOWLEDGE_CHUNKS.map((c) => ({ ...c, embedding: null }));

    try {
      for (const chunk of this.indexed) {
        chunk.embedding = await this.embed(`${chunk.category}: ${chunk.content}`);
      }
      this.embeddingsAvailable = this.indexed.some((c) => c.embedding?.length);
      if (this.embeddingsAvailable) {
        this.logger.log(`RAG indexado com embeddings (${this.embedModel}, ${this.indexed.length} chunks).`);
      }
    } catch (err) {
      this.embeddingsAvailable = false;
      this.logger.warn(
        `RAG usando fallback por keywords (embeddings indisponíveis): ${(err as Error).message}`,
      );
    }
  }

  private async retrieveByEmbedding(query: string, topK: number): Promise<IndexedChunk[]> {
    const queryVec = await this.embed(query);
    if (!queryVec?.length) return this.retrieveByKeywords(query, topK);

    return [...this.indexed]
      .map((chunk) => ({
        chunk,
        score: chunk.embedding ? cosineSimilarity(queryVec, chunk.embedding) : 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(({ chunk }) => chunk);
  }

  private retrieveByKeywords(query: string, topK: number): IndexedChunk[] {
    const tokens = tokenize(query);

    return [...this.indexed]
      .map((chunk) => {
        const haystack = tokenize(`${chunk.category} ${chunk.keywords.join(' ')} ${chunk.content}`);
        const score = tokens.reduce(
          (acc, t) => acc + (haystack.some((h) => h.includes(t) || t.includes(h)) ? 1 : 0),
          0,
        );
        return { chunk, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(({ chunk }) => chunk);
  }

  private async embed(text: string): Promise<number[] | null> {
    try {
      const { data } = await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/api/embeddings`,
          { model: this.embedModel, prompt: text },
          { timeout: 30_000 },
        ),
      );
      const vec = data.embedding as number[] | undefined;
      return vec?.length ? vec : null;
    } catch {
      return null;
    }
  }
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .split(/[\s,.!?;:()\-–—]+/)
    .filter((t) => t.length > 2);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
