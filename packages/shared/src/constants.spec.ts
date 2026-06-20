import { describe, it, expect } from 'vitest';
import {
  SERVICE_PORTS,
  JARVIS_PERSONALITY,
  JARVIS_CREATOR,
  DEFAULT_PIPER_VOICE,
  TERMS_VERSION,
  hasAcceptedCurrentTerms,
} from '../src/constants';

describe('Shared Constants', () => {
  it('should define all service ports', () => {
    expect(SERVICE_PORTS.GATEWAY).toBe(3000);
    expect(SERVICE_PORTS.AI).toBe(3002);
  });

  it('should define JARVIS personality', () => {
    expect(JARVIS_PERSONALITY.name).toBe('JARVIS');
    expect(JARVIS_PERSONALITY.traits).toContain('intelligent');
  });

  it('should define JARVIS creator and default Piper voice', () => {
    expect(JARVIS_CREATOR.name).toBe('Francisco Stanley Rodrigues Albuquerque');
    expect(DEFAULT_PIPER_VOICE).toContain('pt_BR');
  });

  it('should define TERMS_VERSION and validate hasAcceptedCurrentTerms', () => {
    expect(TERMS_VERSION).toBe('2026-06-01');
    expect(hasAcceptedCurrentTerms(null, TERMS_VERSION)).toBe(false);
    expect(hasAcceptedCurrentTerms(new Date(), null)).toBe(false);
    expect(hasAcceptedCurrentTerms(new Date(), '2025-01-01')).toBe(false);
    expect(hasAcceptedCurrentTerms(new Date(), TERMS_VERSION)).toBe(true);
    expect(hasAcceptedCurrentTerms('2026-06-01T00:00:00.000Z', TERMS_VERSION)).toBe(true);
  });
});
