import { describe, it, expect, vi } from 'vitest';
import { TranscribeAudioUseCase } from '../src/application/use-cases/voice.use-cases';

describe('Voice Use Cases', () => {
  it('should transcribe audio', async () => {
    const mock = { transcribe: vi.fn().mockResolvedValue({ text: 'Olá', confidence: 0.9, language: 'pt' }) };
    const uc = new TranscribeAudioUseCase(mock as never);
    const result = await uc.execute({ audioBase64: 'abc' });
    expect(result.text).toBe('Olá');
  });
});
