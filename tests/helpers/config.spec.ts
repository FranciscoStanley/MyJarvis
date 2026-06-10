import { describe, it, expect } from 'vitest';
import { SERVICE_URLS } from './config';

describe('Test helpers', () => {
  it('should define service URLs', () => {
    expect(SERVICE_URLS.gateway).toContain('3000');
  });
});
