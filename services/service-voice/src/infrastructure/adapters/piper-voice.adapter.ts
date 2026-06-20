import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { VoicePort, SynthesizeResult } from '../../domain/ports/voice.port';

/**
 * TTS via Piper (local, MIT) — voz britânica masculina estilo JARVIS.
 * STT permanece no navegador (Web Speech API).
 */
@Injectable()
export class PiperVoiceAdapter implements VoicePort {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async transcribe(
    _audioBase64: string,
    language = 'pt',
  ): Promise<{ text: string; confidence: number; language: string }> {
    throw new BadRequestException({
      message: 'Use o microfone no app. A transcrição é feita pelo Web Speech API do navegador (gratuito).',
      language,
      clientSide: true,
    });
  }

  async synthesize(text: string, voice?: string): Promise<SynthesizeResult> {
    const trimmed = text.trim();
    if (!trimmed) {
      return { audioBase64: '', format: 'wav', clientSide: false, text: '' };
    }

    const piperUrl = this.config.get('PIPER_URL', 'http://piper:5000').replace(/\/$/, '');
    const piperVoice = voice ?? this.config.get('PIPER_VOICE') ?? 'en_GB-alan-medium.onnx';
    const lengthScale = Number(this.config.get('PIPER_LENGTH_SCALE', '1.08'));

    try {
      const { data } = await firstValueFrom(
        this.http.post(
          `${piperUrl}/`,
          { text: trimmed, voice: piperVoice, length_scale: lengthScale },
          { responseType: 'arraybuffer', timeout: 30_000 },
        ),
      );

      return {
        audioBase64: Buffer.from(data).toString('base64'),
        format: 'wav',
        clientSide: false,
        text: trimmed,
        voice: piperVoice.replace(/\.onnx$/, ''),
      };
    } catch {
      return {
        audioBase64: '',
        format: 'browser-tts',
        clientSide: true,
        text: trimmed,
        voice: voice ?? 'en-GB',
        message: 'Piper indisponível — use Web Speech API no navegador.',
      };
    }
  }
}
