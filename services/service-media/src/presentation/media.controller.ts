import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MediaService } from '../application/media.service';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get('play')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter URL reproduzível de mídia' })
  @ApiQuery({ name: 'q', required: true })
  async play(@Query('q') query: string) {
    const data = await this.media.getPlayableUrl(query);
    return { success: true, data, timestamp: new Date().toISOString() };
  }

  @Get('search')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar mídia (música ou vídeo)' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'type', enum: ['music', 'video'], required: false })
  async search(@Query('q') query: string, @Query('type') type: 'music' | 'video' = 'video') {
    const data = await this.media.search(query, type);
    return { success: true, data, timestamp: new Date().toISOString() };
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get() check() { return { status: 'ok', service: 'service-media', version: '1.0.0' }; }
}
