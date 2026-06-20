import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import {
  sanitizeProxyPath,
  pickSafeForwardHeaders,
  shouldExposeSwagger,
  assertJwtSecretSafe,
} from './index';

describe('@myjarvis/nest-security', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env = { ...envBackup };
  });

  afterEach(() => {
    process.env = { ...envBackup };
    vi.restoreAllMocks();
  });

  it('sanitizeProxyPath aceita caminho válido e bloqueia traversal', () => {
    expect(sanitizeProxyPath('/api/chat/session')).toBe('/api/chat/session');
    expect(() => sanitizeProxyPath('../etc/passwd')).toThrow(BadRequestException);
    expect(() => sanitizeProxyPath('/api/../secret')).toThrow(BadRequestException);
  });

  it('pickSafeForwardHeaders remove headers bloqueados', () => {
    const headers = {
      authorization: 'Bearer token',
      host: 'malicious',
      'x-user-id': 'spoofed',
      'accept-language': 'pt-BR',
    };
    const out = pickSafeForwardHeaders(headers, ['authorization', 'host', 'x-user-id', 'accept-language']);
    expect(out.authorization).toBe('Bearer token');
    expect(out['accept-language']).toBe('pt-BR');
    expect(out.host).toBeUndefined();
    expect(out['x-user-id']).toBeUndefined();
  });

  it('shouldExposeSwagger respeita NODE_ENV e ENABLE_SWAGGER', () => {
    process.env.NODE_ENV = 'production';
    process.env.ENABLE_SWAGGER = 'false';
    expect(shouldExposeSwagger()).toBe(false);

    process.env.ENABLE_SWAGGER = 'true';
    expect(shouldExposeSwagger()).toBe(true);

    process.env.NODE_ENV = 'development';
    expect(shouldExposeSwagger()).toBe(true);
  });

  it('assertJwtSecretSafe lança erro em produção com secret fraco', () => {
    const config = {
      get: (key: string) => {
        if (key === 'NODE_ENV') return 'production';
        if (key === 'JWT_SECRET') return 'dev-secret';
        return undefined;
      },
    };
    expect(() => assertJwtSecretSafe(config as any)).toThrow();
  });

  it('assertJwtSecretSafe só avisa em development', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const config = {
      get: (key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'JWT_SECRET') return 'short';
        return undefined;
      },
    };
    expect(() => assertJwtSecretSafe(config as any)).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });
});
