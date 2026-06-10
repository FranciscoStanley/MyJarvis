import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './presentation/health.controller';
import { ProxyController } from './presentation/proxy.controller';
import { ProxyService } from './application/proxy.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({ timeout: 30000 }),
  ],
  controllers: [HealthController, ProxyController],
  providers: [ProxyService],
})
export class AppModule {}
