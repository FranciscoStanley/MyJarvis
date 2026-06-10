import { describe, it, expect, vi } from 'vitest';
import { SearchUseCase } from '../src/application/use-cases/search.use-case';

describe('SearchUseCase', () => {
  it('should delegate to search port', async () => {
    const mock = { searchWeb: vi.fn().mockResolvedValue([{ title: 'Test' }]) };
    const uc = new SearchUseCase(mock as never);
    const results = await uc.execute('web', 'jarvis', 5);
    expect(results).toHaveLength(1);
  });
});
