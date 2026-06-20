import { describe, it, expect } from 'vitest';
import { SERVICE_URLS, skipIfOffline } from '../helpers/live';
import {
  createChatSession,
  loginLiveUser,
  registerLiveUser,
  sendChatMessage,
} from '../helpers/live-auth';

describe('System — Full Stack (live HTTP)', () => {
  it('serviços essenciais respondem health', async (ctx) => {
    await skipIfOffline(ctx, SERVICE_URLS.gateway);
    const healthChecks = await Promise.all([
      fetch(`${SERVICE_URLS.gateway}/api/health`),
      fetch(`${SERVICE_URLS.auth}/api/health`),
      fetch(`${SERVICE_URLS.ai}/api/health`),
    ]);
    for (const check of healthChecks) {
      expect(check.status).toBe(200);
    }
  });

  it('fluxo completo auth + chat atende requisito principal', async (ctx) => {
    await skipIfOffline(ctx, SERVICE_URLS.gateway);
    const { email, password } = await registerLiveUser(SERVICE_URLS.gateway, 'system');
    const token = await loginLiveUser(SERVICE_URLS.gateway, email, password);
    const sessionId = await createChatSession(SERVICE_URLS.gateway, token);
    const reply = await sendChatMessage(
      SERVICE_URLS.gateway,
      token,
      sessionId,
      'Boa noite, qual o nome do seu criador?',
    );

    expect(reply.length).toBeGreaterThan(20);
    expect(reply.toLowerCase()).not.toContain('serviço ollama não respondeu');
  });
});
