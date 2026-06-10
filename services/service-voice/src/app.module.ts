import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VOICE_PORT } from './domain/ports/voice.port';
import { FreeVoiceAdapter } from './infrastructure/adapters/free-voice.adapter';
import { TranscribeAudioUseCase, SynthesizeSpeechUseCase } from './application/use-cases/voice.use-cases';
import { VoiceController, HealthController } from './presentation/voice.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [VoiceController, HealthController],
  providers: [
    TranscribeAudioUseCase, SynthesizeSpeechUseCase,
    { provide: VOICE_PORT, useClass: FreeVoiceAdapter },
  ],
})
export class AppModule {}
