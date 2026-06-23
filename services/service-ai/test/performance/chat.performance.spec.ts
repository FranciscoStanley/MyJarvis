import { describe, it, expect } from 'vitest';
import { SendMessageUseCase } from '../../src/application/use-cases/chat.use-cases';

const TEST_USER = 'perf-user';

function createMockStore() {
  return {
    getMessages: async () => [] as never[],
    addMessage: async () => {},
    createSession: async () => 'perf-session',
    sessionExists: async (sessionId: string) => sessionId === 'perf-session',
  };
}

describe('Performance — SendMessageUseCase', () => {
  it('1000 execuções em < 2s (mocks)', async () => {
    const mockAi = { generateResponse: async () => ({ reply: 'OK', actions: [] }) };
    const mockStore = createMockStore();
    const mockSearch = { search: async () => [] };
    const useCase = new SendMessageUseCase(mockAi as never, mockStore as never, mockSearch as never);

    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      await useCase.execute({ message: `msg ${i}`, sessionId: 'perf-session', userId: TEST_USER });
    }
    expect(performance.now() - start).toBeLessThan(2000);
  });

  it('latência unitária < 80ms', async () => {
    const mockAi = { generateResponse: async () => ({ reply: 'Fast', actions: [] }) };
    const mockStore = createMockStore();
    const uc = new SendMessageUseCase(mockAi as never, mockStore as never, { search: async () => [] } as never);
    const start = performance.now();
    await uc.execute({ message: 'test', userId: TEST_USER });
    expect(performance.now() - start).toBeLessThan(80);
  });
});
