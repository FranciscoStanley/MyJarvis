import { describe, it, expect, vi } from 'vitest';
import { TranscribeAudioUseCase, SynthesizeSpeechUseCase } from '../src/application/use-cases/voice.use-cases';

describe('Voice Use Cases (free stack)', () => {
  const mock = {
    transcribe: vi.fn(),
    synthesize: vi.fn().mockResolvedValue({ audioBase64: '', format: 'browser-tts', clientSide: true, text: 'Olá' }),
  };

  it('should synthesize via Piper wav by default', async () => {
    mock.synthesize.mockResolvedValue({
      audioBase64: 'UklGRg==',
      format: 'wav',
      clientSide: false,
      text: 'Good morning, sir.',
      voice: 'en_GB-alan-medium',
    });
    const uc = new SynthesizeSpeechUseCase(mock as never);
    const result = await uc.execute({ text: 'Good morning, sir.' });
    expect(result.format).toBe('wav');
    expect(result.clientSide).toBe(false);
  });

  it('should delegate transcribe to port', async () => {
    mock.transcribe.mockRejectedValue(new Error('use browser'));
    const uc = new TranscribeAudioUseCase(mock as never);
    await expect(uc.execute({ audioBase64: 'abc' })).rejects.toThrow();
  });
});
