import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../constants';
import { UserRole } from '@myjarvis/shared';

function makeContext(
  headers: Record<string, string> = {},
  reqRef?: { headers?: Record<string, string>; user?: unknown },
) {
  const req = reqRef ?? { headers };
  return {
    getHandler: () => 'handler',
    getClass: () => 'class',
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as any;
}

describe('JwtAuthGuard', () => {
  const jwt = { verify: vi.fn() };
  const reflector = { getAllAndOverride: vi.fn() };
  let guard: JwtAuthGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new JwtAuthGuard(jwt as any, reflector as any);
  });

  it('permite rota pública', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => key === IS_PUBLIC_KEY);
    const ok = guard.canActivate(makeContext());
    expect(ok).toBe(true);
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it('bloqueia quando não há Bearer token', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    expect(() => guard.canActivate(makeContext({}))).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(makeContext({}))).toThrow('Token ausente');
  });

  it('anexa usuário quando token é válido', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const req = { headers: { authorization: 'Bearer abc' } };
    jwt.verify.mockReturnValue({
      sub: 'u1',
      email: 'u@test.com',
      roles: [UserRole.USER],
    });

    const ok = guard.canActivate(makeContext(req.headers, req));
    expect(ok).toBe(true);
    expect((req as any).user.sub).toBe('u1');
  });

  it('bloqueia token inválido', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid');
    });
    expect(() =>
      guard.canActivate(makeContext({ authorization: 'Bearer invalid' })),
    ).toThrow('Token inválido ou expirado');
  });
});
