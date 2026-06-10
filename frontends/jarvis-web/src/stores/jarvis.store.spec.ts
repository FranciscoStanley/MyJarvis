import { describe, it, expect } from 'vitest';
import { JARVIS_PERSONALITY } from '@myjarvis/shared';

describe('Jarvis Store', () => {
  it('should have JARVIS personality defined', () => {
    expect(JARVIS_PERSONALITY.name).toBe('JARVIS');
  });
});
