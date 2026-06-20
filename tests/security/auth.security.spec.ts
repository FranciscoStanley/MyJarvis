import { describe, it, expect } from 'vitest';
import { SERVICE_URLS, skipIfOffline } from '../helpers/live';

describe('Security — Auth endpoints (black-box)', () => {
  it('bloqueia register sem aceite de termos', async (ctx) => {
    await skipIfOffline(ctx, SERVICE_URLS.gateway);
    const res = await fetch(`${SERVICE_URLS.gateway}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `security-${Date.now()}@jarvis.test`,
        password: 'SenhaSegura123!',
        name: 'Security',
        acceptTerms: false,
      }),
    });
    expect(res.status).toBe(400);
  });

  it('bloqueia profile sem token JWT', async (ctx) => {
    await skipIfOffline(ctx, SERVICE_URLS.gateway);
    const res = await fetch(`${SERVICE_URLS.gateway}/api/auth/profile`);
    expect(res.status).toBe(401);
  });

  it('bloqueia profile com token inválido', async (ctx) => {
    await skipIfOffline(ctx, SERVICE_URLS.gateway);
    const res = await fetch(`${SERVICE_URLS.gateway}/api/auth/profile`, {
      headers: { Authorization: 'Bearer invalid-token' },
    });
    expect(res.status).toBe(401);
  });

  it('bloqueia accept-terms sem autenticação', async (ctx) => {
    await skipIfOffline(ctx, SERVICE_URLS.gateway);
    const res = await fetch(`${SERVICE_URLS.gateway}/api/auth/accept-terms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acceptTerms: true }),
    });
    expect(res.status).toBe(401);
  });
});
