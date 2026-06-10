import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY, NotificationRepositoryPort } from '../../domain/ports/notification.port';

@Injectable()
export class SendNotificationUseCase {
  constructor(@Inject(NOTIFICATION_REPOSITORY) private readonly repo: NotificationRepositoryPort) {}
  execute(dto: { userId: string; title: string; body: string; type: 'info' | 'alert' | 'reminder'; data?: Record<string, unknown> }) {
    return this.repo.save(dto);
  }
}

@Injectable()
export class GetUserNotificationsUseCase {
  constructor(@Inject(NOTIFICATION_REPOSITORY) private readonly repo: NotificationRepositoryPort) {}
  execute(userId: string) { return this.repo.findByUser(userId); }
}

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(@Inject(NOTIFICATION_REPOSITORY) private readonly repo: NotificationRepositoryPort) {}
  async execute(id: string) {
    const n = await this.repo.markAsRead(id);
    if (!n) throw new NotFoundException('Notificação não encontrada');
    return n;
  }
}
