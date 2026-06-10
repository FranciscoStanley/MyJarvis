import { Injectable, Inject } from '@nestjs/common';
import { VOICE_PORT, VoicePort } from '../../domain/ports/voice.port';

@Injectable()
export class TranscribeAudioUseCase {
  constructor(@Inject(VOICE_PORT) private readonly voice: VoicePort) {}
  execute(dto: { audioBase64: string; language?: string }) {
    return this.voice.transcribe(dto.audioBase64, dto.language);
  }
}

@Injectable()
export class SynthesizeSpeechUseCase {
  constructor(@Inject(VOICE_PORT) private readonly voice: VoicePort) {}
  execute(dto: { text: string; voice?: string }) {
    return this.voice.synthesize(dto.text, dto.voice);
  }
}
