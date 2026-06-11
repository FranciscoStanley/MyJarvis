import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '@myjarvis/nest-auth';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  @Public()
  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: 'Health check do gateway' })
  check() {
    return {
      status: 'ok',
      service: 'service-gateway',
      version: '1.0.0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}
