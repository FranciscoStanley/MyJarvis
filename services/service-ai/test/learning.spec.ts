import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { validateLearningContent, extractKeywords } from '../src/domain/services/learning-validator';
import { shouldPersistLearning, buildLearningCandidate } from '../src/domain/services/learning-extractor';
import { FileLearningStoreAdapter } from '../src/infrastructure/adapters/file-learning-store.adapter';

describe('learning-validator', () => {
  it('should reject harmful content', () => {
    const result = validateLearningContent({
      topic: 'Invasão',
      summary: 'Como hackear uma rede corporativa passo a passo com exploit',
      keywords: ['hack'],
      category: 'security',
      source: 'web_search',
    });
    expect(result.allowed).toBe(false);
  });

  it('should allow legitimate technical learning', () => {
    const result = validateLearningContent({
      topic: 'NestJS Guards',
      summary: 'Guards no NestJS protegem rotas verificando JWT antes do handler — usar @UseGuards(JwtAuthGuard) no controller.',
      keywords: ['nestjs', 'guards', 'jwt'],
      category: 'technology',
      source: 'doc_search',
    });
    expect(result.allowed).toBe(true);
  });

  it('should extract keywords without stop words', () => {
    const keywords = extractKeywords('Como configurar guards no NestJS para JWT');
    expect(keywords).toContain('configurar');
    expect(keywords).toContain('nestjs');
    expect(keywords).not.toContain('como');
  });
});

describe('learning-extractor', () => {
  it('should persist on explicit learn command', () => {
    expect(
      shouldPersistLearning({
        userMessage: 'JARVIS, aprenda isso sobre Docker compose',
        synthesizedReply: 'Docker Compose orquestra múltiplos containers com um arquivo YAML declarativo para desenvolvimento local.',
      }),
    ).toBe(true);
  });

  it('should build candidate from search results', () => {
    const candidate = buildLearningCandidate({
      userMessage: 'Como usar guards no NestJS?',
      synthesizedReply: 'Guards são executados antes do route handler e podem bloquear requisições não autenticadas com JwtAuthGuard.',
      searchResults: [{ title: 'Guards - NestJS', url: 'https://docs.nestjs.com/guards', snippet: '...', type: 'web' }],
      actionTypes: ['docs'],
    });
    expect(candidate?.source).toBe('doc_search');
    expect(candidate?.category).toBe('technology');
  });
});

describe('FileLearningStoreAdapter', () => {
  let tmpDir: string;
  let store: FileLearningStoreAdapter;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'jarvis-learn-'));
    const config = {
      get: (key: string, def?: string) => {
        if (key === 'LEARNING_DATA_PATH') return path.join(tmpDir, 'learn.json');
        if (key === 'LEARNING_MAX_ENTRIES') return '10';
        return def;
      },
    };
    store = new FileLearningStoreAdapter(config as never);
    await store.onModuleInit();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('should save and recall learned entry', async () => {
    const saved = await store.save({
      topic: 'Scrum Sprint Planning',
      summary: 'Sprint Planning define o objetivo do sprint e seleciona itens do backlog com capacidade realista da equipe.',
      keywords: ['scrum', 'sprint', 'planning'],
      category: 'project-management',
      source: 'conversation',
    });
    expect(saved).not.toBeNull();

    const found = await store.search('sprint planning scrum', 2);
    expect(found.length).toBeGreaterThan(0);
    expect(found[0].topic).toContain('Scrum');
  });

  it('should reject unethical content on save', async () => {
    const saved = await store.save({
      topic: 'Malware',
      summary: 'Tutorial completo para criar ransomware e distribuir via phishing em redes corporativas.',
      keywords: ['malware'],
      category: 'general',
      source: 'web_search',
    });
    expect(saved).toBeNull();
  });
});
