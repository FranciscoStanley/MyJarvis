import { describe, it, expect, vi } from 'vitest';
import { MediaService } from '../src/application/media.service';
import { of } from 'rxjs';

describe('MediaService', () => {
  it('should search media via search service', async () => {
    const mockHttp = { post: vi.fn().mockReturnValue(of({ data: { data: [{ title: 'Video', url: 'https://youtube.com/watch?v=abc123' }] } })) };
    const svc = new MediaService(mockHttp as never, { get: () => 'http://search:3004' } as never);
    const results = await svc.search('jarvis', 'video');
    expect(results).toHaveLength(1);
    expect(results[0].embedUrl).toContain('embed/abc123');
  });
});
