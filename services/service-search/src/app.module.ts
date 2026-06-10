import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { SEARCH_PORT } from './domain/ports/search.port';
import { FreeSearchAdapter } from './infrastructure/adapters/search.adapter';
import { SearchUseCase } from './application/use-cases/search.use-case';
import { SearchController, HealthController } from './presentation/search.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [SearchController, HealthController],
  providers: [
    SearchUseCase,
    { provide: SEARCH_PORT, useClass: FreeSearchAdapter },
  ],
})
export class AppModule {}
