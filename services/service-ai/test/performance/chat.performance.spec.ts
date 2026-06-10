import { describe, it, expect } from 'vitest';
import { SendMessageUseCase } from '../../src/application/use-cases/chat.use-cases';

describe('Performance — SendMessageUseCase', () => {
  it('1000 execuções em < 2s (mocks)', async () => {
    const mockAi = { generateResponse: async () => ({ reply: 'OK', actions: [] }) };
    const mockStore = {
      getMessages: () => [] as never[],
      addMessage: () => {},
      createSession: () => 'perf-session',
    };
    const mockSearch = { search: async () => [] };
    const useCase = new SendMessageUseCase(mockAi as never, mockStore as never, mockSearch as never);

    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      await useCase.execute({ message: `msg ${i}`, sessionId: 'perf-session' });
    }
    expect(performance.now() - start).toBeLessThan(2000);
  });

  it('latência unitária < 50ms', async () => {
    const mockAi = { generateResponse: async () => ({ reply: 'Fast', actions: [] }) };
    const mockStore = {
      getMessages: () => [],
      addMessage: () => {},
      createSession: () => 's1',
    };
    const uc = new SendMessageUseCase(mockAi as never, mockStore as never, { search: async () => [] } as never);
    const start = performance.now();
    await uc.execute({ message: 'test' });
    expect(performance.now() - start).toBeLessThan(50);
  });
});
