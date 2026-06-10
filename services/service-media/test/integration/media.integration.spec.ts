import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { MediaService } from '../../src/application/media.service';

describe('Media Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(MediaService)
      .useValue({
        search: vi.fn().mockResolvedValue([
          { title: 'Video', url: 'https://youtube.com/watch?v=abc', type: 'video' },
        ]),
        getPlayableUrl: vi.fn().mockResolvedValue({
          title: 'Music', url: 'https://archive.org/details/x', type: 'music',
        }),
      })
      .compile();

    app = module.createNestApplication();
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

  it('GET /api/media/play?q=query', async () => {
    const res = await request(app.getHttpServer()).get('/api/media/play').query({ q: 'jarvis' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Music');
  });

  it('GET /api/media/search?q=query&type=video', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/media/search')
      .query({ q: 'iron man', type: 'video' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});
