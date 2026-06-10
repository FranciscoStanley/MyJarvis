import { describe, it, expect } from 'vitest';
import autocannon from 'autocannon';
import { SERVICE_URLS } from '../helpers/config';
import { skipIfOffline } from '../helpers/live';

function runAutocannon(url: string, opts: autocannon.Options) {
  return new Promise<autocannon.Result>((resolve, reject) => {
    autocannon({ url, ...opts }, (err, result) => (err ? reject(err) : resolve(result)));
  });
}

describe('Performance — Gateway health', () => {
  it('p95 latency < 500ms com 50 conexões por 5s', async (ctx) => {
    await skipIfOffline(ctx, SERVICE_URLS.gateway);
    const result = await runAutocannon(`${SERVICE_URLS.gateway}/api/health`, {
      connections: 50,
      duration: 5,
      pipelining: 1,
    });

    expect(result.timeouts).toBe(0);
    expect(result.non2xx).toBe(0);
    expect(result.latency.p95).toBeLessThan(500);
    console.log(`  req/s: ${result.requests.average.toFixed(0)} | p95: ${result.latency.p95}ms`);
  }, 60000);
});

describe('Performance — Search service', () => {
  it('POST /api/search/web p95 < 3000ms', async (ctx) => {
    await skipIfOffline(ctx, SERVICE_URLS.search);
    const result = await runAutocannon(`${SERVICE_URLS.search}/api/search/web`, {
      connections: 10,
      duration: 5,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'jarvis ai', limit: 3 }),
    });

    expect(result.timeouts).toBe(0);
    expect(result.latency.p95).toBeLessThan(3000);
    console.log(`  search req/s: ${result.requests.average.toFixed(0)} | p95: ${result.latency.p95}ms`);
  }, 60000);
});
