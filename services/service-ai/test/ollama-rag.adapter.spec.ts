import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OllamaRagAdapter } from '../src/infrastructure/adapters/ollama-rag.adapter';

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
});
