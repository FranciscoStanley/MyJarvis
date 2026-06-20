import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { VOICE_PORT } from './domain/ports/voice.port';
import { PiperVoiceAdapter } from './infrastructure/adapters/piper-voice.adapter';
import { TranscribeAudioUseCase, SynthesizeSpeechUseCase } from './application/use-cases/voice.use-cases';
import { VoiceController, HealthController } from './presentation/voice.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({ timeout: 30_000 }),
  ],
  controllers: [VoiceController, HealthController],
  providers: [
    TranscribeAudioUseCase,
    SynthesizeSpeechUseCase,
    { provide: VOICE_PORT, useClass: PiperVoiceAdapter },
  ],
})
export class AppModule {}
