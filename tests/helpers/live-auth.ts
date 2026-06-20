export async function registerLiveUser(
  gatewayUrl: string,
  suffix: string,
): Promise<{ email: string; password: string }> {
  const email = `${suffix}-${Date.now()}@jarvis.test`;
  const password = 'SenhaSegura123!';
  const register = await fetch(`${gatewayUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      name: 'Live Test User',
      acceptTerms: true,
    }),
  });
  if (![200, 201].includes(register.status)) {
    throw new Error(`Falha no register live: ${register.status}`);
  }
  return { email, password };
}

export async function loginLiveUser(
  gatewayUrl: string,
  email: string,
  password: string,
): Promise<string> {
  const login = await fetch(`${gatewayUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (login.status !== 200) {
    throw new Error(`Falha no login live: ${login.status}`);
  }
  const body = await login.json();
  const token = body.data?.accessToken as string | undefined;
  if (!token) throw new Error('Token ausente no login live');
  return token;
}

export async function createChatSession(gatewayUrl: string, token: string): Promise<string> {
  const res = await fetch(`${gatewayUrl}/api/chat/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: '{}',
  });
  if (![200, 201].includes(res.status)) {
    throw new Error(`Falha ao criar sessão: ${res.status}`);
  }
  const body = await res.json();
  const sessionId = body.data?.sessionId as string | undefined;
  if (!sessionId) throw new Error('sessionId ausente');
  return sessionId;
}

export async function sendChatMessage(
  gatewayUrl: string,
  token: string,
  sessionId: string,
  message: string,
): Promise<string> {
  const timeoutMs = Number(process.env.LIVE_CHAT_TIMEOUT_MS ?? 420_000);
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const res = await fetch(`${gatewayUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId, message }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.status !== 200) {
        throw new Error(`Falha em /api/chat/message: ${res.status}`);
      }
      const body = await res.json();
      return String(body.data?.reply ?? '');
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error('Falha inesperada ao enviar mensagem');
}
