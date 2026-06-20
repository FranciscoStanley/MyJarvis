import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { Roles } from './roles.decorator';
import { Public } from './public.decorator';
import { AuthThrottle, THROTTLE_AUTH_KEY } from './auth-throttle.decorator';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../constants';
import { UserRole } from '@myjarvis/shared';

describe('Nest Auth Decorators', () => {
  it('Roles aplica metadata de roles', () => {
    class Dummy {
      @Roles(UserRole.ADMIN)
      method() {}
    }
    expect(Reflect.getMetadata(ROLES_KEY, Dummy.prototype.method)).toEqual([UserRole.ADMIN]);
  });

  it('Public aplica metadata isPublic', () => {
    class Dummy {
      @Public()
      method() {}
    }
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, Dummy.prototype.method)).toBe(true);
  });

  it('AuthThrottle aplica metadata de throttle reforçado', () => {
    class Dummy {
      @AuthThrottle()
      method() {}
    }
    expect(Reflect.getMetadata(THROTTLE_AUTH_KEY, Dummy.prototype.method)).toBe(true);
  });
});
