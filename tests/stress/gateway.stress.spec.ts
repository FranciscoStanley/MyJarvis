import { describe, it, expect } from 'vitest';
import autocannon from 'autocannon';
import { SERVICE_URLS } from '../helpers/config';
import { skipIfOffline } from '../helpers/live';

function runAutocannon(url: string, opts: autocannon.Options) {
  return new Promise<autocannon.Result>((resolve, reject) => {
    autocannon({ url, ...opts }, (err, result) => (err ? reject(err) : resolve(result)));
  });
}

describe('Stress — Gateway health endpoint', () => {
  it('suporta 200 conexões por 15s sem timeouts', async (ctx) => {
    await skipIfOffline(ctx, SERVICE_URLS.gateway);
    const result = await runAutocannon(`${SERVICE_URLS.gateway}/api/health`, {
      connections: 200,
      duration: 15,
      pipelining: 10,
    });

    const errorRate = result.timeouts + result.non2xx;
    const total = result.requests.total || 1;
    const errorPct = (errorRate / total) * 100;

    expect(result.timeouts).toBeLessThan(total * 0.01);
    expect(errorPct).toBeLessThan(5);
    console.log(
      `  stress: ${result.requests.total} reqs | ${result.requests.average.toFixed(0)} req/s | ` +
        `errors: ${errorPct.toFixed(2)}% | p99: ${result.latency.p99}ms`,
    );
  }, 120000);
});

describe('Stress — Notifications burst', () => {
  it('100 POST simultâneos em service-notifications', async (ctx) => {
    const url = process.env.NOTIFICATIONS_URL ?? 'http://localhost:3005';
    await skipIfOffline(ctx, url);

    const result = await runAutocannon(`${url}/api/notifications/send`, {
      connections: 100,
      duration: 10,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'stress-user',
        title: 'Stress test',
        body: 'Load test notification',
        type: 'info',
      }),
    });

    expect(result.timeouts).toBeLessThan(result.requests.total * 0.05);
    console.log(`  notifications: ${result.requests.average.toFixed(0)} req/s`);
  }, 120000);
});
