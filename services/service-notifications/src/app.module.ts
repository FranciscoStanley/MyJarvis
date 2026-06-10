import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NOTIFICATION_REPOSITORY } from './domain/ports/notification.port';
import { InMemoryNotificationRepository } from './infrastructure/repositories/in-memory-notification.repository';
import { SendNotificationUseCase, GetUserNotificationsUseCase, MarkNotificationReadUseCase } from './application/use-cases/notification.use-cases';
import { NotificationsController, HealthController } from './presentation/notifications.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [NotificationsController, HealthController],
  providers: [
    SendNotificationUseCase, GetUserNotificationsUseCase, MarkNotificationReadUseCase,
    { provide: NOTIFICATION_REPOSITORY, useClass: InMemoryNotificationRepository },
  ],
})
export class AppModule {}
