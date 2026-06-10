import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendMessageUseCase } from '../src/application/use-cases/chat.use-cases';

describe('SendMessageUseCase', () => {
  const mockAi = { generateResponse: vi.fn() };
  const mockStore = {
    getMessages: vi.fn().mockReturnValue([]),
    addMessage: vi.fn(),
    createSession: vi.fn().mockReturnValue('session-1'),
  };
  const mockSearch = { search: vi.fn().mockResolvedValue([]) };

  let useCase: SendMessageUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new SendMessageUseCase(mockAi as never, mockStore as never, mockSearch as never);
  });

  it('should send message and return reply', async () => {
    mockAi.generateResponse.mockResolvedValue({
      reply: 'Bom dia, senhor.',
      actions: [],
    });

    const result = await useCase.execute({ message: 'Olá JARVIS' });
    expect(result.reply).toBe('Bom dia, senhor.');
    expect(result.sessionId).toBe('session-1');
    expect(mockStore.addMessage).toHaveBeenCalledTimes(2);
  });

  it('should execute search actions', async () => {
    mockAi.generateResponse.mockResolvedValue({
      reply: 'Vou buscar isso.',
      actions: [{ type: 'search', query: 'tempo hoje' }],
    });
    mockSearch.search.mockResolvedValue([{ title: 'Result' }]);

    const result = await useCase.execute({ message: 'Busque o tempo' });
    expect(mockSearch.search).toHaveBeenCalledWith('web', 'tempo hoje');
    expect(result.searchResults).toHaveLength(1);
  });
});
