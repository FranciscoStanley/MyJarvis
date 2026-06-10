import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { SEARCH_PORT } from '../../src/domain/ports/search.port';

const mockResults = [
  { title: 'Test', url: 'https://example.com', snippet: 'snippet', type: 'web' as const },
];

describe('Search Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(SEARCH_PORT)
      .useValue({
        searchWeb: vi.fn().mockResolvedValue(mockResults),
        searchImages: vi.fn().mockResolvedValue(mockResults),
        searchVideos: vi.fn().mockResolvedValue(mockResults),
        searchMusic: vi.fn().mockResolvedValue(mockResults),
      })
      .compile();

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

  it.each(['web', 'images', 'videos', 'music'] as const)('POST /api/search/%s', async (type) => {
    const res = await request(app.getHttpServer())
      .post(`/api/search/${type}`)
      .send({ query: 'jarvis', limit: 3 });
    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
