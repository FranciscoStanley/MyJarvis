import { LearnedEntry, LearnedEntryInput } from '../entities/learned-entry.entity';

export interface LearningStats {
  total: number;
  maxEntries: number;
  byCategory: Record<string, number>;
  lastLearnedAt?: string;
}

export interface LearningStorePort {
  save(entry: LearnedEntryInput): Promise<LearnedEntry | null>;
  search(query: string, topK?: number): Promise<LearnedEntry[]>;
  findByTopic(topic: string): Promise<LearnedEntry | null>;
  listRecent(limit?: number): Promise<LearnedEntry[]>;
  markUsed(id: string): Promise<void>;
  getStats(): Promise<LearningStats>;
}

export const LEARNING_STORE = Symbol('LEARNING_STORE');
