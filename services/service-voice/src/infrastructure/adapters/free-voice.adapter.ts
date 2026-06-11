import { Injectable, BadRequestException } from '@nestjs/common';
import { VoicePort } from '../../domain/ports/voice.port';

/**
 * Voz 100% gratuita — processamento principal no navegador:
 * - STT: Web Speech API (Chrome, Edge, Safari)
 * - TTS: Web Speech Synthesis API
 *
 * Sem OpenAI Whisper, sem Azure pago, sem licenças.
 */
@Injectable()
export class FreeVoiceAdapter implements VoicePort {
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

  async synthesize(text: string, voice = 'pt-BR') {
    return {
      audioBase64: '',
      format: 'browser-tts',
      clientSide: true,
      text,
      voice,
      message: 'Reproduza via Web Speech Synthesis no frontend (gratuito, sem licença).',
    };
  }
}
