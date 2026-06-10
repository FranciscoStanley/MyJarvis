import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('Voice Integration', () => {
  let app: INestApplication;

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

  it('POST /api/voice/synthesize retorna clientSide TTS', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/voice/synthesize')
      .send({ text: 'Bom dia, senhor.' });
    expect([200, 201]).toContain(res.status);
    expect(res.body.data.clientSide).toBe(true);
  });

  it('POST /api/voice/transcribe orienta uso do browser', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/voice/transcribe')
      .send({ audioBase64: 'abc' });
    expect(res.status).toBe(400);
  });
});
