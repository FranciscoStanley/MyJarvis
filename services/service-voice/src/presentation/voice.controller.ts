import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TranscribeDto, SynthesizeDto } from './dto/voice.dto';
import { TranscribeAudioUseCase, SynthesizeSpeechUseCase } from '../application/use-cases/voice.use-cases';

@ApiTags('Voice')
@Controller('voice')
export class VoiceController {
  constructor(
    private readonly transcribe: TranscribeAudioUseCase,
    private readonly synthesize: SynthesizeSpeechUseCase,
  ) {}

  @Post('transcribe')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transcrever áudio para texto (Whisper)' })
  async transcribeAudio(@Body() dto: TranscribeDto) {
    const data = await this.transcribe.execute(dto);
    return { success: true, data, timestamp: new Date().toISOString() };
  }

  @Post('synthesize')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sintetizar texto em áudio (TTS)' })
  async synthesizeSpeech(@Body() dto: SynthesizeDto) {
    const data = await this.synthesize.execute(dto);
    return { success: true, data, timestamp: new Date().toISOString() };
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get() check() { return { status: 'ok', service: 'service-voice', version: '1.0.0' }; }
}
