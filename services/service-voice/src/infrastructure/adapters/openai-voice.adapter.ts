import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { VoicePort } from '../../domain/ports/voice.port';

@Injectable()
export class OpenAiVoiceAdapter implements VoicePort {
  private readonly client: OpenAI | null;

  constructor(config: ConfigService) {
    const key = config.get('OPENAI_API_KEY');
    this.client = key ? new OpenAI({ apiKey: key }) : null;
  }

  async transcribe(audioBase64: string, language = 'pt') {
    if (!this.client) {
      return { text: '[Transcrição simulada — configure OPENAI_API_KEY]', confidence: 0.5, language };
    }
    const buffer = Buffer.from(audioBase64, 'base64');
    const file = new File([buffer], 'audio.webm', { type: 'audio/webm' });
    const result = await this.client.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language,
    });
    return { text: result.text, confidence: 0.95, language };
  }

  async synthesize(text: string, voice = 'onyx') {
    if (!this.client) {
      return { audioBase64: '', format: 'mp3' };
    }
    const response = await this.client.audio.speech.create({
      model: 'tts-1',
      voice: voice as 'onyx',
      input: text,
    });
    const arrayBuffer = await response.arrayBuffer();
    return { audioBase64: Buffer.from(arrayBuffer).toString('base64'), format: 'mp3' };
  }
}
