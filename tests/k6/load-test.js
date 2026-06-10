import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.GATEWAY_URL || 'http://localhost:3000';

export default function loadTest() {
  const health = http.get(`${BASE_URL}/api/health`);
  check(health, {
    'health status 200': (r) => r.status === 200,
    'health body ok': (r) => r.json('status') === 'ok',
  });

  const session = http.post(`${BASE_URL}/api/chat/session`);
  check(session, {
    'session created': (r) => r.status === 201 || r.status === 200,
  });

  sleep(1);
}
