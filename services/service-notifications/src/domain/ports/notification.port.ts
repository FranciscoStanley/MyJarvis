export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'info' | 'alert' | 'reminder';
  read: boolean;
  createdAt: Date;
  data?: Record<string, unknown>;
}

export interface NotificationRepositoryPort {
  save(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<Notification>;
  findByUser(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<Notification | null>;
}
export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');
