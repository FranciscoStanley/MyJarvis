import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MediaService } from './application/media.service';
import { MediaController, HealthController } from './presentation/media.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [MediaController, HealthController],
  providers: [MediaService],
})
export class AppModule {}
