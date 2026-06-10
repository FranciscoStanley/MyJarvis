import { describe, it, expect } from 'vitest';
import { InMemoryNotificationRepository } from '../src/infrastructure/repositories/in-memory-notification.repository';

describe('Notifications', () => {
  it('should save and retrieve notifications', async () => {
    const repo = new InMemoryNotificationRepository();
    const n = await repo.save({ userId: 'u1', title: 'Test', body: 'Body', type: 'info' });
    const list = await repo.findByUser('u1');
    expect(list).toHaveLength(1);
    expect(n.id).toBeDefined();
  });
});
