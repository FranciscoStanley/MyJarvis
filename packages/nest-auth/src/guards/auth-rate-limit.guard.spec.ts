import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthRateLimitGuard } from './auth-rate-limit.guard';
import { THROTTLE_AUTH_KEY } from '../decorators/auth-throttle.decorator';

function makeContext(ip = '127.0.0.1') {
  return {
    getHandler: () => 'handler',
    getClass: () => 'class',
    switchToHttp: () => ({
      getRequest: () => ({ ip }),
    }),
  } as any;
}

describe('AuthRateLimitGuard', () => {
  const reflector = { getAllAndOverride: vi.fn() };
  let guard: AuthRateLimitGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new AuthRateLimitGuard(reflector as any);
  });

  it('ignora rota não marcada com AuthThrottle', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => key === THROTTLE_AUTH_KEY ? false : undefined);
    expect(guard.canActivate(makeContext())).toBe(true);
  });

  it('bloqueia após exceder limite por IP', () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    for (let i = 0; i < 10; i += 1) {
      expect(guard.canActivate(makeContext('10.0.0.1'))).toBe(true);
    }
    try {
      guard.canActivate(makeContext('10.0.0.1'));
      throw new Error('Expected rate limit exception');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      const ex = err as HttpException;
      expect(ex.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }
  });
});
