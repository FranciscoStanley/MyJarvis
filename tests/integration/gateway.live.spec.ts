import { describe, it, expect } from 'vitest';
import { SERVICE_URLS } from '../helpers/config';
import { skipIfOffline } from '../helpers/live';

describe('Integration — Gateway (live HTTP)', () => {
  it('GET /api/health retorna ok', async (ctx) => {
    await skipIfOffline(ctx, SERVICE_URLS.gateway);
    const res = await fetch(`${SERVICE_URLS.gateway}/api/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('service-gateway');
  });

  it('Gateway responde em menos de 2s', async (ctx) => {
    await skipIfOffline(ctx, SERVICE_URLS.gateway);
    const start = performance.now();
    await fetch(`${SERVICE_URLS.gateway}/api/health`);
    expect(performance.now() - start).toBeLessThan(2000);
  });
});

describe('Integration — Auth flow (live HTTP)', () => {
  const email = `test-${Date.now()}@jarvis.test`;

  it('POST /api/auth/register + login', async (ctx) => {
    await skipIfOffline(ctx, SERVICE_URLS.gateway);
    const register = await fetch(`${SERVICE_URLS.gateway}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'SenhaSegura123!', name: 'Test User' }),
    });
    expect(register.status).toBeLessThan(500);

    const login = await fetch(`${SERVICE_URLS.gateway}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'SenhaSegura123!' }),
    });
    expect(login.status).toBe(200);
    const body = await login.json();
    expect(body.data?.accessToken).toBeDefined();
  });
});

describe('Integration — Chat (live HTTP)', () => {
  it('POST /api/chat/session', async (ctx) => {
    await skipIfOffline(ctx, SERVICE_URLS.gateway);

    const email = `chat-${Date.now()}@jarvis.test`;
    await fetch(`${SERVICE_URLS.gateway}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'SenhaSegura123!', name: 'Chat Test' }),
    });

    const login = await fetch(`${SERVICE_URLS.gateway}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'SenhaSegura123!' }),
    });
    expect(login.status).toBe(200);
    const loginBody = await login.json();
    const token = loginBody.data?.accessToken;
    expect(token).toBeDefined();

    const res = await fetch(`${SERVICE_URLS.gateway}/api/chat/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: '{}',
    });
    expect([200, 201]).toContain(res.status);
    const body = await res.json();
    expect(body.data?.sessionId).toBeDefined();
  });
});
