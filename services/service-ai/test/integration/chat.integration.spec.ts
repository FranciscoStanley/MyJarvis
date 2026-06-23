import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { AI_PORT, CONVERSATION_STORE, SEARCH_CLIENT } from '../../src/domain/ports/ai.port';
import { RAG_PORT } from '../../src/domain/ports/rag.port';
import { LEARNING_STORE } from '../../src/domain/ports/learning-store.port';
import { InMemoryConversationStore } from '../../src/infrastructure/adapters/memory-store.adapter';
import { OllamaWarmupService } from '../../src/infrastructure/adapters/ollama-warmup.service';
import { closeTestApp } from '../helpers/test-app';

const TEST_USER = { id: 'test-user-1', email: 'test@jarvis.local', roles: ['user'] };

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
      .overrideProvider(CONVERSATION_STORE)
      .useClass(InMemoryConversationStore)
      .overrideProvider(RAG_PORT)
      .useValue({
        isReady: () => true,
        retrieve: vi.fn().mockResolvedValue(''),
      })
      .overrideProvider(LEARNING_STORE)
      .useValue({
        save: vi.fn().mockResolvedValue(null),
        search: vi.fn().mockResolvedValue([]),
        getStats: vi.fn().mockResolvedValue({ total: 0, maxEntries: 500, byCategory: {} }),
      })
      .overrideProvider(OllamaWarmupService)
      .useValue({ onModuleInit: vi.fn() })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  }, 60_000);

  afterAll(async () => {
    await closeTestApp(app);
  }, 30_000);

  const withUser = (req: request.Test) =>
    req
      .set('x-user-id', TEST_USER.id)
      .set('x-user-email', TEST_USER.email)
      .set('x-user-roles', TEST_USER.roles.join(','));

  it('GET /api/health', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('service-ai');
    expect(res.body.rag).toBeDefined();
    expect(res.body.rag.chunks).toBeGreaterThan(0);
  });

  it('POST /api/chat/session', async () => {
    const res = await withUser(request(app.getHttpServer()).post('/api/chat/session'));
    expect([200, 201]).toContain(res.status);
    expect(res.body.data.sessionId).toBeDefined();
  });

  it('GET /api/chat/sessions lista conversas do usuário', async () => {
    const res = await withUser(request(app.getHttpServer()).get('/api/chat/sessions'));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/chat/message retorna resposta JARVIS', async () => {
    const session = await withUser(request(app.getHttpServer()).post('/api/chat/session'));
    const res = await withUser(
      request(app.getHttpServer())
        .post('/api/chat/message')
        .send({ message: 'Olá JARVIS', sessionId: session.body.data.sessionId }),
    );
    expect([200, 201]).toContain(res.status);
    expect(res.body.data.reply).toContain('senhor');
    expect(res.body.data).toHaveProperty('sessionId');
  });

  it('GET /api/chat/session/:id retorna histórico persistido', async () => {
    const session = await withUser(request(app.getHttpServer()).post('/api/chat/session'));
    const sessionId = session.body.data.sessionId;

    await withUser(
      request(app.getHttpServer())
        .post('/api/chat/message')
        .send({ message: 'Teste persistência', sessionId }),
    );

    const history = await withUser(
      request(app.getHttpServer()).get(`/api/chat/session/${sessionId}`),
    );
    expect(history.status).toBe(200);
    expect(history.body.data.messages.length).toBeGreaterThanOrEqual(2);
  });

  it('POST /api/chat/message rejeita mensagem vazia', async () => {
    const res = await withUser(request(app.getHttpServer()).post('/api/chat/message').send({ message: '' }));
    expect(res.status).toBe(400);
  });

  it('POST /api/chat/session rejeita sem x-user-id', async () => {
    const res = await request(app.getHttpServer()).post('/api/chat/session');
    expect(res.status).toBe(401);
  });
});
