import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { OllamaAdapter } from '../src/infrastructure/adapters/ollama.adapter';

describe('OllamaAdapter', () => {
  const mockHttp = { post: vi.fn() };
  const mockConfig = { get: vi.fn((key: string, def: string) => def) };
  let adapter: OllamaAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new OllamaAdapter(mockHttp as never, mockConfig as never);
  });

  it('should generate response from Ollama', async () => {
    mockHttp.post.mockReturnValue(
      of({
        data: {
          message: { role: 'assistant', content: 'Bom dia, senhor.' },
        },
      }),
    );

    const result = await adapter.generateResponse([], 'Olá');
    expect(result.reply).toBe('Bom dia, senhor.');
  });

  it('should fallback when Ollama is offline with search actions', async () => {
    mockHttp.post.mockReturnValue(throwError(() => new Error('ECONNREFUSED')));

    const result = await adapter.generateResponse([], 'busque notícias de IA');
    expect(result.reply).toContain('busca solicitada');
    expect(result.actions.some((a) => a.type === 'search')).toBe(true);
  });

  it('should mention Ollama when offline without detectable actions', async () => {
    mockHttp.post.mockReturnValue(throwError(() => new Error('ECONNREFUSED')));

    const result = await adapter.generateResponse([], 'Olá');
    expect(result.reply).toContain('Ollama');
  });

  it('should detect YouTube music as video action on fallback', async () => {
    mockHttp.post.mockReturnValue(throwError(() => new Error('timeout')));

    const result = await adapter.generateResponse([], 'busca no YouTube a música Espírito Santo');
    expect(result.actions).toEqual([{ type: 'video', query: 'Espírito Santo' }]);
  });
});
