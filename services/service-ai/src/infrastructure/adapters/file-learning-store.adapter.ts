import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { LearnedEntry, LearnedEntryInput } from '../../domain/entities/learned-entry.entity';
import { LearningStats, LearningStorePort } from '../../domain/ports/learning-store.port';
import { validateLearningContent } from '../../domain/services/learning-validator';

interface PersistedStore {
  version: 1;
  entries: LearnedEntry[];
}

@Injectable()
export class FileLearningStoreAdapter implements LearningStorePort, OnModuleInit {
  private readonly logger = new Logger(FileLearningStoreAdapter.name);
  private readonly filePath: string;
  private readonly maxEntries: number;
  private entries: LearnedEntry[] = [];
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(config: ConfigService) {
    this.filePath = config.get('LEARNING_DATA_PATH', './data/jarvis-learned-knowledge.json');
    this.maxEntries = Number(config.get('LEARNING_MAX_ENTRIES', 500));
  }

  async onModuleInit() {
    await this.load();
    this.logger.log(`Learning store: ${this.entries.length} entradas em ${this.filePath}`);
  }

  async save(input: LearnedEntryInput): Promise<LearnedEntry | null> {
    const validation = validateLearningContent(input);
    if (!validation.allowed) {
      this.logger.warn(`Aprendizado rejeitado: ${validation.reason}`);
      return null;
    }

    const existing = await this.findByTopic(input.topic);
    if (existing) {
      existing.summary = input.summary;
      existing.keywords = input.keywords;
      existing.category = input.category;
      existing.lastUsedAt = new Date().toISOString();
      existing.useCount += 1;
      existing.confidence = Math.max(existing.confidence, input.confidence ?? 0.7);
      await this.persist();
      return existing;
    }

    const entry: LearnedEntry = {
      id: randomUUID(),
      topic: input.topic.trim(),
      summary: input.summary.trim(),
      keywords: input.keywords,
      category: input.category,
      source: input.source,
      sourceQuery: input.sourceQuery,
      confidence: input.confidence ?? 0.7,
      createdAt: new Date().toISOString(),
      useCount: 0,
    };

    this.entries.unshift(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries);
    }

    await this.persist();
    this.logger.log(`Aprendizado salvo: [${entry.category}] ${entry.topic.slice(0, 60)}`);
    return entry;
  }

  async search(query: string, topK = 3): Promise<LearnedEntry[]> {
    const tokens = tokenize(query);
    if (!tokens.length) return [];

    const ranked = this.entries
      .map((entry) => {
        const haystack = tokenize(`${entry.topic} ${entry.keywords.join(' ')} ${entry.summary}`);
        let score = tokens.reduce(
          (acc, t) => acc + (haystack.some((h) => h.includes(t) || t.includes(h)) ? 1 : 0),
          0,
        );
        score += entry.confidence * 0.5;
        return { entry, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    for (const { entry } of ranked) {
      await this.markUsed(entry.id);
    }

    return ranked.map(({ entry }) => entry);
  }

  async findByTopic(topic: string): Promise<LearnedEntry | null> {
    const normalized = topic.trim().toLowerCase();
    return this.entries.find((e) => e.topic.toLowerCase() === normalized) ?? null;
  }

  async listRecent(limit = 10): Promise<LearnedEntry[]> {
    return this.entries.slice(0, limit);
  }

  async markUsed(id: string): Promise<void> {
    const entry = this.entries.find((e) => e.id === id);
    if (!entry) return;
    entry.lastUsedAt = new Date().toISOString();
    entry.useCount += 1;
    await this.persist();
  }

  async getStats(): Promise<LearningStats> {
    const byCategory: Record<string, number> = {};
    for (const e of this.entries) {
      byCategory[e.category] = (byCategory[e.category] ?? 0) + 1;
    }
    return {
      total: this.entries.length,
      maxEntries: this.maxEntries,
      byCategory,
      lastLearnedAt: this.entries[0]?.createdAt,
    };
  }

  private async load() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw) as PersistedStore;
      if (parsed?.version === 1 && Array.isArray(parsed.entries)) {
        this.entries = parsed.entries;
      }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(`Falha ao carregar learning store: ${(err as Error).message}`);
      }
      await this.ensureDir();
    }
  }

  private async persist() {
    this.writeQueue = this.writeQueue.then(async () => {
      await this.ensureDir();
      const payload: PersistedStore = { version: 1, entries: this.entries };
      await fs.writeFile(this.filePath, JSON.stringify(payload, null, 2), 'utf8');
    });
    await this.writeQueue;
  }

  private async ensureDir() {
    await fs.mkdir(path.dirname(path.resolve(this.filePath)), { recursive: true });
  }
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .split(/[\s,.!?;:()\-–—/]+/)
    .filter((t) => t.length > 2);
}
