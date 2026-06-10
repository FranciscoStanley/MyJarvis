import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationRepositoryPort } from '../../domain/ports/notification.port';

@Injectable()
export class InMemoryNotificationRepository implements NotificationRepositoryPort {
  private store: Notification[] = [];

  async save(data: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    const notification: Notification = { ...data, id: uuidv4(), read: false, createdAt: new Date() };
    this.store.push(notification);
    return notification;
  }

  async findByUser(userId: string) {
    return this.store.filter((n) => n.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markAsRead(id: string) {
    const n = this.store.find((x) => x.id === id);
    if (n) n.read = true;
    return n ?? null;
  }
}
