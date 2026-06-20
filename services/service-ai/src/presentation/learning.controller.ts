import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GetLearningStatsUseCase } from '../application/use-cases/learning.use-cases';

@ApiTags('Learning')
@Controller('learning')
export class LearningController {
  constructor(private readonly getStats: GetLearningStatsUseCase) {}

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Estatísticas da memória de aprendizado persistente',
    description: 'Conhecimento adquirido via buscas, peers e conversas — filtrado por ética antes de salvar.',
  })
  async stats() {
    const data = await this.getStats.execute();
    return { success: true, data, timestamp: new Date().toISOString() };
  }
}
