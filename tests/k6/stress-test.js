import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '2m', target: 300 },
    { duration: '1m', target: 500 },
    { duration: '2m', target: 500 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.GATEWAY_URL || 'http://localhost:3000';

export default function stressTest() {
  const res = http.batch([
    ['GET', `${BASE_URL}/api/health`, null, { tags: { name: 'health' } }],
    ['POST', `${BASE_URL}/api/chat/session`, null, { tags: { name: 'session' } }],
    ['POST', `${BASE_URL}/api/search/web`, JSON.stringify({ query: 'test', limit: 2 }), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'search' },
    }],
  ]);

  res.forEach((r, i) => {
    check(r, { [`batch ${i} ok`]: (x) => x.status < 500 });
  });

  sleep(0.5);
}
