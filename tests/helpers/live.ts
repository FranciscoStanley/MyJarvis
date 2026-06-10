import { SERVICE_URLS } from '../helpers/config';

export type LiveContext = { skip: () => void };

export async function skipIfOffline(ctx: LiveContext, url: string): Promise<boolean> {
  const { isServiceUp } = await import('../helpers/config');
  const up = await isServiceUp(url);
  if (!up) ctx.skip();
  return up;
}

export { SERVICE_URLS };
