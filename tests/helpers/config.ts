export const SERVICE_URLS = {
  gateway: process.env.GATEWAY_URL ?? 'http://localhost:3000',
  auth: process.env.AUTH_URL ?? 'http://localhost:3001',
  ai: process.env.AI_URL ?? 'http://localhost:3002',
  search: process.env.SEARCH_URL ?? 'http://localhost:3004',
  notifications: process.env.NOTIFICATIONS_URL ?? 'http://localhost:3005',
};

export async function isServiceUp(url: string, path = '/api/health'): Promise<boolean> {
  try {
    const res = await fetch(`${url}${path}`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function requireLiveServices(services: Record<string, string>): Promise<boolean> {
  const results = await Promise.all(
    Object.entries(services).map(async ([name, url]) => ({
      name,
      up: await isServiceUp(url),
    })),
  );
  const down = results.filter((r) => !r.up);
  if (down.length > 0) {
    console.warn(`[skip] Serviços offline: ${down.map((d) => d.name).join(', ')}`);
    return false;
  }
  return true;
}
