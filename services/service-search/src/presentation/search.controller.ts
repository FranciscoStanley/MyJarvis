import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchQueryDto } from './dto/search.dto';
import { SearchUseCase } from '../application/use-cases/search.use-case';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchUseCase) {}

  @Post('web')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Busca na web' })
  async web(@Body() dto: SearchQueryDto) {
    const data = await this.search.execute('web', dto.query, dto.limit);
    return { success: true, data, timestamp: new Date().toISOString() };
  }

  @Post('images')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Busca de imagens' })
  async images(@Body() dto: SearchQueryDto) {
    const data = await this.search.execute('images', dto.query, dto.limit);
    return { success: true, data, timestamp: new Date().toISOString() };
  }

  @Post('videos')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Busca de vídeos' })
  async videos(@Body() dto: SearchQueryDto) {
    const data = await this.search.execute('videos', dto.query, dto.limit);
    return { success: true, data, timestamp: new Date().toISOString() };
  }

  @Post('music')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Busca de músicas' })
  async music(@Body() dto: SearchQueryDto) {
    const data = await this.search.execute('music', dto.query, dto.limit);
    return { success: true, data, timestamp: new Date().toISOString() };
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get() check() { return { status: 'ok', service: 'service-search', version: '1.0.0' }; }
}
