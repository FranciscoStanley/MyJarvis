import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { PiperVoiceAdapter } from '../src/infrastructure/adapters/piper-voice.adapter';

describe('PiperVoiceAdapter', () => {
  const mockHttp = { post: vi.fn() };
  const mockConfig = {
    get: vi.fn((key: string, fallback?: string) => {
      const map: Record<string, string> = {
        PIPER_URL: 'http://piper:5000',
        PIPER_VOICE: 'en_GB-alan-medium.onnx',
        PIPER_LENGTH_SCALE: '1.08',
      };
      return map[key] ?? fallback;
    }),
  };

  let adapter: PiperVoiceAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new PiperVoiceAdapter(mockHttp as never, mockConfig as never);
  });

  it('should synthesize wav via Piper HTTP API', async () => {
    mockHttp.post.mockReturnValue(of({ data: Buffer.from('RIFFwav') }));

    const result = await adapter.synthesize('Good morning, sir.');

    expect(result.format).toBe('wav');
    expect(result.clientSide).toBe(false);
    expect(result.audioBase64).toBeTruthy();
    expect(mockHttp.post).toHaveBeenCalledWith(
      'http://piper:5000/',
      expect.objectContaining({
        text: 'Good morning, sir.',
        voice: 'en_GB-alan-medium.onnx',
        length_scale: 1.08,
      }),
      expect.objectContaining({ responseType: 'arraybuffer' }),
    );
  });

  it('should fallback to browser TTS metadata when Piper fails', async () => {
    mockHttp.post.mockReturnValue(throwError(() => new Error('ECONNREFUSED')));

    const result = await adapter.synthesize('Hello');

    expect(result.format).toBe('browser-tts');
    expect(result.clientSide).toBe(true);
    expect(result.text).toBe('Hello');
  });
});
