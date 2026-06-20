import { ClientAction, SearchResult, UserRole, AuthSource } from '@myjarvis/shared';

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  authSource?: AuthSource;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') localStorage.setItem('jarvis_token', token);
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') localStorage.removeItem('jarvis_token');
  }

  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('jarvis_token');
    }
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let res: Response;
    try {
      res = await fetch(`${API_URL}/api${path}`, { ...options, headers });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Falha de rede';
      throw new Error(
        /abort/i.test(msg)
          ? 'A resposta demorou demais. Tente um pedido mais curto ou aguarde o Ollama carregar.'
          : `Não foi possível contactar o servidor (${API_URL}). Verifique se o gateway está em execução.`,
      );
    }

    let json: Record<string, unknown>;
    try {
      json = await res.json();
    } catch {
      throw new Error('Resposta inválida do servidor.');
    }

    if (!res.ok) {
      const message = json.message ?? json.error;
      throw new Error(typeof message === 'string' ? message : 'Erro na requisição');
    }

    return (json.data ?? json) as T;
  }

  login(email: string, password: string) {
    return this.request<{ accessToken: string; user: ApiUser }>(
      '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) },
    );
  }

  loginLdap(username: string, password: string) {
    return this.request<{ accessToken: string; user: ApiUser }>(
      '/auth/login/ldap', { method: 'POST', body: JSON.stringify({ username, password }) },
    );
  }

  getProfile() {
    return this.request<ApiUser>('/auth/profile');
  }

  register(email: string, password: string, name: string) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) });
  }

  createSession() {
    return this.request<{ sessionId: string }>(
      '/chat/session',
      { method: 'POST', body: '{}' },
    );
  }

  sendMessage(message: string, sessionId?: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 130_000);

    return this.request<{
      reply: string;
      sessionId: string;
      actions?: unknown[];
      searchResults?: SearchResult[];
      clientActions?: ClientAction[];
    }>(
      '/chat/message',
      {
        method: 'POST',
        body: JSON.stringify({ message, sessionId }),
        signal: controller.signal,
      },
    ).finally(() => clearTimeout(timeout));
  }

  synthesizeSpeech(text: string, voice?: string) {
    return this.request<{
      audioBase64: string;
      format: string;
      clientSide?: boolean;
      text?: string;
      voice?: string;
      message?: string;
    }>(
      '/voice/synthesize',
      { method: 'POST', body: JSON.stringify({ text, voice }) },
    );
  }

  search(type: string, query: string) {
    return this.request<unknown[]>(`/search/${type}`, { method: 'POST', body: JSON.stringify({ query, limit: 5 }) });
  }
}

export const api = new ApiClient();
