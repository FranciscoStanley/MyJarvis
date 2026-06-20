import { describe, it, expect } from 'vitest';
import { SERVICE_URLS, skipIfOffline } from '../helpers/live';
import {
  createChatSession,
  loginLiveUser,
  registerLiveUser,
  sendChatMessage,
} from '../helpers/live-auth';

describe('UAT — Jornada real do usuário (live)', () => {
  it('usuário registra, autentica e recebe resposta útil no chat', async (ctx) => {
    await skipIfOffline(ctx, SERVICE_URLS.gateway);
    const { email, password } = await registerLiveUser(SERVICE_URLS.gateway, 'uat');
    const token = await loginLiveUser(SERVICE_URLS.gateway, email, password);
    const sessionId = await createChatSession(SERVICE_URLS.gateway, token);

    const reply = await sendChatMessage(
      SERVICE_URLS.gateway,
      token,
      sessionId,
      'Diga o nome completo do seu criador em uma linha.',
    );

    expect(reply.length).toBeGreaterThan(20);
    expect(reply.toLowerCase()).toContain('francisco stanley rodrigues albuquerque');
  }, 480_000);
});
