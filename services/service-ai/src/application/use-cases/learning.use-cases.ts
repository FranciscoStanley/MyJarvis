import { Injectable, Inject, Optional } from '@nestjs/common';
import { SearchResult } from '@myjarvis/shared';
import { LEARNING_STORE, LearningStorePort } from '../../domain/ports/learning-store.port';
import { buildLearningCandidate, LearningExtractionInput } from '../../domain/services/learning-extractor';

@Injectable()
export class PersistLearningUseCase {
  constructor(
    @Optional() @Inject(LEARNING_STORE) private readonly store?: LearningStorePort,
  ) {}

  async execute(input: LearningExtractionInput): Promise<boolean> {
    if (!this.store) return false;

    const candidate = buildLearningCandidate(input);
    if (!candidate) return false;

    const saved = await this.store.save(candidate);
    return Boolean(saved);
  }
}

@Injectable()
export class GetLearningStatsUseCase {
  constructor(
    @Optional() @Inject(LEARNING_STORE) private readonly store?: LearningStorePort,
  ) {}

  async execute() {
    if (!this.store) {
      return { total: 0, maxEntries: 0, byCategory: {} };
    }
    return this.store.getStats();
  }
}

export interface RecallLearningOutput {
  entries: Awaited<ReturnType<LearningStorePort['search']>>;
}

@Injectable()
export class RecallLearningUseCase {
  constructor(
    @Optional() @Inject(LEARNING_STORE) private readonly store?: LearningStorePort,
  ) {}

  async execute(query: string, topK = 3): Promise<RecallLearningOutput> {
    if (!this.store) return { entries: [] };
    const entries = await this.store.search(query, topK);
    return { entries };
  }
}

/** Monta texto de insight peer para síntese e aprendizado. */
export function formatPeerInsight(peerId: string, answer: string): string {
  if (!answer.trim()) return '';
  return `Consulta ao peer "${peerId}": ${answer.trim()}`;
}

export function mergeSearchWithPeer(
  searchResults: SearchResult[],
  peerAnswer: string,
  peerId: string,
): SearchResult[] {
  if (!peerAnswer.trim()) return searchResults;
  return [
    {
      title: `Segunda opinião — modelo ${peerId}`,
      url: `peer://${peerId}`,
      snippet: peerAnswer.trim().slice(0, 500),
      type: 'web',
    },
    ...searchResults,
  ];
}
