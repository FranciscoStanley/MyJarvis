import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OllamaRagAdapter } from '../src/infrastructure/adapters/ollama-rag.adapter';
import { KNOWLEDGE_STATS } from '../src/domain/knowledge/knowledge-index';

describe('OllamaRagAdapter', () => {
  const mockHttp = { post: vi.fn() };
  const mockConfig = {
    get: vi.fn((key: string, def: string) => def),
  };
  let adapter: OllamaRagAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHttp.post.mockRejectedValue(new Error('embeddings unavailable'));
    adapter = new OllamaRagAdapter(mockHttp as never, mockConfig as never);
  });

  it('should retrieve context by keywords when embeddings fail', async () => {
    const context = await adapter.retrieve('abra o youtube e toque música gospel', 2);
    expect(context).toContain('YOUTUBE');
    expect(context.length).toBeGreaterThan(20);
  });

  it('should return google search knowledge for google queries', async () => {
    const context = await adapter.retrieve('busque no google notícias de IA', 2);
    expect(context.toLowerCase()).toMatch(/google|busca/);
  });

  it('should return creator identity for origin questions', async () => {
    const context = await adapter.retrieve('quem te criou?', 2);
    expect(context).toContain('Francisco Stanley Rodrigues Albuquerque');
  });

  it('should return dev agent knowledge for code review queries', async () => {
    const context = await adapter.retrieve('faça um code review desse controller', 3);
    expect(context.toUpperCase()).toMatch(/CODE REVIEW|REVIEW/);
    expect(context).toMatch(/Critical|🔴|Veredito/i);
  });

  it('should return clean architecture knowledge for refactoring queries', async () => {
    const context = await adapter.retrieve('refatorar para clean architecture com use cases', 3);
    expect(context.toLowerCase()).toMatch(/clean architecture|use case|domain/);
  });

  it('should return skill/rule knowledge for cursor ecosystem queries', async () => {
    const context = await adapter.retrieve('como criar uma skill e rule no cursor', 3);
    expect(context.toLowerCase()).toMatch(/skill|rule|\.cursor/);
  });

  it('should return doc search knowledge for documentation queries', async () => {
    const context = await adapter.retrieve('documentação oficial do NestJS guards', 3);
    expect(context.toUpperCase()).toMatch(/DOC_SEARCH|DOCUMENTAÇÃO/);
  });

  it('should return project blueprint knowledge for system creation', async () => {
    const context = await adapter.retrieve('criar um sistema robusto com microserviços', 3);
    expect(context.toUpperCase()).toMatch(/BLUEPRINT|CHECKLIST/);
  });

  it('should return cybersecurity knowledge for defense queries', async () => {
    const context = await adapter.retrieve('cibersegurança proteger servidor', 3);
    expect(context.toUpperCase()).toMatch(/CIBERSEGURANÇA|OWASP/);
  });

  it('should return cursor open knowledge for IDE commands', async () => {
    const context = await adapter.retrieve('abra o cursor', 2);
    expect(context.toLowerCase()).toMatch(/cursor/);
  });

  it('should index all knowledge chunks after retrieve', async () => {
    expect(KNOWLEDGE_STATS.total).toBeGreaterThan(26);
    await adapter.retrieve('youtube', 1);
    expect(adapter.isReady()).toBe(true);
  });
});
