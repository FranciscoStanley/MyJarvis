import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('Notifications Integration', () => {
  let app: INestApplication;
  let notificationId: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.status).toBe(200);
  });

  it('POST /api/notifications/send', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/notifications/send')
      .send({ userId: 'u1', title: 'Test', body: 'Body', type: 'info' });
    expect([200, 201]).toContain(res.status);
    notificationId = res.body.data.id;
  });

  it('GET /api/notifications/user/:userId', async () => {
    const res = await request(app.getHttpServer()).get('/api/notifications/user/u1');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('PATCH /api/notifications/:id/read', async () => {
    const res = await request(app.getHttpServer()).patch(`/api/notifications/${notificationId}/read`);
    expect(res.status).toBe(200);
    expect(res.body.data.read).toBe(true);
  });
});
