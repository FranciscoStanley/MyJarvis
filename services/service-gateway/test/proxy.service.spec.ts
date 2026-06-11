import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProxyService } from '../src/application/proxy.service';
import { of } from 'rxjs';

describe('ProxyService', () => {
  let service: ProxyService;
  const mockHttp = { request: vi.fn() };
  const mockConfig = {
    get: vi.fn((key: string, defaultVal: string) => defaultVal),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProxyService(mockHttp as never, mockConfig as never);
  });

  it('should return service URL', () => {
    expect(service.getServiceUrl('ai')).toContain('3002');
  });

  it('should forward requests', async () => {
    mockHttp.request.mockReturnValue(of({ data: { ok: true }, status: 200 }));
    const result = await service.forward('auth', 'POST', '/api/auth/login', { email: 'test@test.com' });
    expect(result).toEqual({ ok: true });
  });

  it('should reject path traversal', async () => {
    await expect(service.forward('auth', 'GET', '/api/../etc/passwd')).rejects.toThrow();
  });
});
