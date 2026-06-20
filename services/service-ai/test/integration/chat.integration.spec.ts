import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { AI_PORT, SEARCH_CLIENT } from '../../src/domain/ports/ai.port';
import { closeTestApp } from '../helpers/test-app';

describe('AI Chat Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AI_PORT)
      .useValue({
        generateResponse: vi.fn().mockResolvedValue({
          reply: 'Bom dia, senhor. Sistemas operacionais.',
          actions: [],
        }),
        synthesizeWithResults: vi.fn().mockResolvedValue(''),
      })
      .overrideProvider(SEARCH_CLIENT)
      .useValue({ search: vi.fn().mockResolvedValue([]) })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('GET /api/health', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('service-ai');
    expect(res.body.rag).toBeDefined();
    expect(res.body.rag.chunks).toBeGreaterThan(0);
  });

  it('POST /api/chat/session', async () => {
    const res = await request(app.getHttpServer()).post('/api/chat/session');
    expect([200, 201]).toContain(res.status);
    expect(res.body.data.sessionId).toBeDefined();
  });

  it('POST /api/chat/message retorna resposta JARVIS', async () => {
    const session = await request(app.getHttpServer()).post('/api/chat/session');
    const res = await request(app.getHttpServer())
      .post('/api/chat/message')
      .send({ message: 'Olá JARVIS', sessionId: session.body.data.sessionId });
    expect([200, 201]).toContain(res.status);
    expect(res.body.data.reply).toContain('senhor');
    expect(res.body.data).toHaveProperty('sessionId');
  });

  it('POST /api/chat/message rejeita mensagem vazia', async () => {
    const res = await request(app.getHttpServer()).post('/api/chat/message').send({ message: '' });
    expect(res.status).toBe(400);
  });
});
