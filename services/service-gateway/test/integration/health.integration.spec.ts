import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { createTestApp, closeTestApp } from '../helpers/test-app';
import { AppModule } from '../../src/app.module';

describe('Gateway Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp({ imports: [AppModule] });
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('GET /api/health', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('service-gateway');
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/health responde JSON válido', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('uptime');
  });
});
