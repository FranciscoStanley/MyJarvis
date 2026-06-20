import { describe, it, expect } from 'vitest';
import { SERVICE_URLS, skipIfOffline } from '../helpers/live';
import {
  createChatSession,
  loginLiveUser,
  registerLiveUser,
  sendChatMessage,
} from '../helpers/live-auth';

describe('Regression — Critical Chat Path', () => {
  it('resposta sobre criador não deve regredir para fallback de indisponibilidade', async (ctx) => {
    await skipIfOffline(ctx, SERVICE_URLS.gateway);
    const { email, password } = await registerLiveUser(SERVICE_URLS.gateway, 'regression');
    const token = await loginLiveUser(SERVICE_URLS.gateway, email, password);
    const sessionId = await createChatSession(SERVICE_URLS.gateway, token);
    const reply = await sendChatMessage(
      SERVICE_URLS.gateway,
      token,
      sessionId,
      'Responda apenas com o nome completo do seu criador.',
    );

    expect(reply).toBeTruthy();
    expect(reply.toLowerCase()).not.toContain('serviço ollama não respondeu');
    expect(reply.toLowerCase()).toContain('francisco stanley rodrigues albuquerque');
  }, 480_000);
});
