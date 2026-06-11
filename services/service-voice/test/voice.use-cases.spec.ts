import { describe, it, expect, vi } from 'vitest';
import { TranscribeAudioUseCase, SynthesizeSpeechUseCase } from '../src/application/use-cases/voice.use-cases';

describe('Voice Use Cases (free stack)', () => {
  const mock = {
    transcribe: vi.fn(),
    synthesize: vi.fn().mockResolvedValue({ audioBase64: '', format: 'browser-tts', clientSide: true, text: 'Olá' }),
  };

  it('should synthesize via client-side TTS metadata', async () => {
    const uc = new SynthesizeSpeechUseCase(mock as never);
    const result = await uc.execute({ text: 'Olá' });
    expect(result.format).toBe('browser-tts');
  });

  it('should delegate transcribe to port', async () => {
    mock.transcribe.mockRejectedValue(new Error('use browser'));
    const uc = new TranscribeAudioUseCase(mock as never);
    await expect(uc.execute({ audioBase64: 'abc' })).rejects.toThrow();
  });
});
