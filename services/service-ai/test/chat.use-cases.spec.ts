import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendMessageUseCase } from '../src/application/use-cases/chat.use-cases';

const TEST_USER = 'user-test';

describe('SendMessageUseCase', () => {
  const mockAi = {
    generateResponse: vi.fn(),
    synthesizeWithResults: vi.fn(),
  };
  const mockStore = {
    getMessages: vi.fn().mockResolvedValue([]),
    addMessage: vi.fn().mockResolvedValue(undefined),
    createSession: vi.fn().mockResolvedValue('session-1'),
    sessionExists: vi.fn().mockResolvedValue(false),
  };
  const mockSearch = { search: vi.fn().mockResolvedValue([]) };

  const mockPersistLearning = { execute: vi.fn().mockResolvedValue(false) };

  let useCase: SendMessageUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAi.synthesizeWithResults.mockResolvedValue('');
    mockStore.getMessages.mockReset();
    mockStore.getMessages.mockResolvedValue([]);
    mockStore.addMessage.mockReset();
    mockStore.addMessage.mockResolvedValue(undefined);
    mockStore.createSession.mockResolvedValue('session-1');
    mockStore.sessionExists.mockResolvedValue(false);
    useCase = new SendMessageUseCase(
      mockAi as never,
      mockStore as never,
      mockSearch as never,
      undefined,
      mockPersistLearning as never,
    );
  });

  it('should send message and return reply', async () => {
    mockAi.generateResponse.mockResolvedValue({
      reply: 'Bom dia, senhor.',
      actions: [],
    });

    const result = await useCase.execute({ message: 'Olá JARVIS', userId: TEST_USER });
    expect(result.reply).toBe('Bom dia, senhor.');
    expect(result.sessionId).toBe('session-1');
    expect(mockStore.addMessage).toHaveBeenCalledTimes(2);
  });

  it('should execute search actions and synthesize reply', async () => {
    mockAi.generateResponse.mockResolvedValue({
      reply: 'Vou buscar isso.',
      actions: [{ type: 'search', query: 'tempo hoje' }],
    });
    mockSearch.search.mockResolvedValue([
      { title: 'Clima', url: 'https://example.com', snippet: 'Ensolarado', type: 'web' },
    ]);
    mockAi.synthesizeWithResults.mockResolvedValue('Senhor, o tempo está ensolarado hoje.');

    const result = await useCase.execute({ message: 'Busque o tempo', userId: TEST_USER });
    expect(mockSearch.search).toHaveBeenCalledWith('web', 'tempo hoje');
    expect(result.searchResults).toHaveLength(1);
    expect(result.reply).toContain('ensolarado');
    expect(result.clientActions?.length).toBeGreaterThan(0);
  });

  it('should execute doc_search with site-restricted query', async () => {
    mockAi.generateResponse.mockResolvedValue({
      reply: 'Consultando a documentação.',
      actions: [{ type: 'docs', query: 'guards', data: { technology: 'nestjs' } }],
    });
    mockSearch.search.mockResolvedValue([
      { title: 'Guards | NestJS', url: 'https://docs.nestjs.com/guards', snippet: 'Guards...', type: 'web' },
    ]);
    mockAi.synthesizeWithResults.mockResolvedValue('Senhor, guards no NestJS protegem rotas com CanActivate.');

    const result = await useCase.execute({ message: 'como usar guards no NestJS', userId: TEST_USER });
    expect(mockSearch.search).toHaveBeenCalledWith('web', 'site:docs.nestjs.com guards');
    expect(result.reply).toContain('guards');
  });

  it('should handle confirmation yes and return executable actions', async () => {
    const pending = [{
      id: 'a1',
      type: 'open_url' as const,
      label: 'Abrir no YouTube',
      description: 'Abrir vídeo',
      url: 'https://youtube.com/watch?v=1',
      app: 'youtube' as const,
      requiresConfirmation: true,
    }];
    mockStore.getMessages.mockResolvedValue([
      { role: 'assistant', metadata: { pendingClientActions: pending } },
    ]);

    const result = await useCase.execute({ message: 'sim', userId: TEST_USER });
    expect(result.clientActions?.[0].requiresConfirmation).toBe(false);
    expect(result.reply).toMatch(/senhor/i);
  });

  it('should handle confirmation no', async () => {
    mockStore.getMessages.mockResolvedValue([
      {
        role: 'assistant',
        metadata: {
          pendingClientActions: [{
            id: 'a1',
            type: 'open_url',
            label: 'Abrir',
            description: 'Abrir',
            url: 'https://x.com',
            requiresConfirmation: true,
          }],
        },
      },
    ]);

    const result = await useCase.execute({ message: 'não', userId: TEST_USER });
    expect(result.clientActions).toEqual([]);
    expect(result.reply).toMatch(/como desejar/i);
  });

  it('should auto-execute explicit open without confirmation prompt', async () => {
    mockAi.generateResponse.mockResolvedValue({
      reply: 'À sua disposição, senhor. Abrindo conforme solicitado.',
      actions: [],
    });

    const result = await useCase.execute({ message: 'Abra o YouTube', userId: TEST_USER });
    expect(result.clientActions?.length).toBeGreaterThan(0);
    expect(result.clientActions?.some((a) => a.app === 'youtube' && a.requiresConfirmation === false)).toBe(true);
    expect(result.reply).not.toMatch(/Deseja que eu/i);
  });

  it('should preserve contextual reply on follow-up instead of replacing with synthesis', async () => {
    const history = [
      { id: '1', role: 'user', content: 'Quais modelos você conversou?', timestamp: new Date() },
      { id: '2', role: 'assistant', content: 'Gemma2 e Mistral.', timestamp: new Date() },
    ];
    mockStore.getMessages.mockResolvedValue(history);
    mockStore.sessionExists.mockResolvedValue(true);

    mockAi.generateResponse.mockResolvedValue({
      reply: 'Senhor, detalho as conversas com Gemma2 sobre contextualização…',
      actions: [{ type: 'peer_ai', query: 'detalhes', data: { peerId: 'mistral' } }],
    });
    mockAi.synthesizeWithResults.mockResolvedValue('Resposta genérica sem contexto.');

    const result = await useCase.execute({
      message: 'Conte mais sobre as conversas de forma detalhada.',
      sessionId: 'session-1',
      userId: TEST_USER,
    });

    expect(result.reply).toContain('Gemma2');
    expect(result.reply).not.toBe('Resposta genérica sem contexto.');
    expect(mockAi.synthesizeWithResults).not.toHaveBeenCalled();
  });
});
