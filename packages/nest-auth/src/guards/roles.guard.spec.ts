import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../constants';
import { UserRole } from '@myjarvis/shared';

function makeContext(userRoles: UserRole[]) {
  return {
    getHandler: () => 'handler',
    getClass: () => 'class',
    switchToHttp: () => ({
      getRequest: () => ({ user: { roles: userRoles } }),
    }),
  } as any;
}

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: vi.fn() };
  let guard: RolesGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new RolesGuard(reflector as any);
  });

  it('permite quando rota não exige roles', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => key === ROLES_KEY ? [] : undefined);
    expect(guard.canActivate(makeContext([UserRole.USER]))).toBe(true);
  });

  it('bloqueia quando usuário não tem role requerida', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    expect(() => guard.canActivate(makeContext([UserRole.USER]))).toThrow(ForbiddenException);
    expect(() => guard.canActivate(makeContext([UserRole.USER]))).toThrow('Permissão insuficiente');
  });

  it('permite quando usuário tem role requerida', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    expect(guard.canActivate(makeContext([UserRole.ADMIN]))).toBe(true);
  });
});
