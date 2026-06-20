import { describe, it, expect } from 'vitest';
import { detectConfirmationIntent, getPendingClientActions } from '../src/actions';

describe('detectConfirmationIntent', () => {
  it('should detect yes', () => {
    expect(detectConfirmationIntent('sim')).toBe('yes');
    expect(detectConfirmationIntent('pode abrir')).toBe('yes');
    expect(detectConfirmationIntent('claro, por favor')).toBe('yes');
  });

  it('should detect no', () => {
    expect(detectConfirmationIntent('não')).toBe('no');
    expect(detectConfirmationIntent('nao precisa')).toBe('no');
    expect(detectConfirmationIntent('cancela')).toBe('no');
  });

  it('should return none for unrelated text', () => {
    expect(detectConfirmationIntent('busque música no youtube')).toBe('none');
  });
});

describe('getPendingClientActions', () => {
  it('should return pending actions from last assistant message', () => {
    const pending = [{ id: '1', type: 'open_url' as const, label: 'Abrir', description: '', url: 'https://x.com', requiresConfirmation: true }];
    const messages = [
      { role: 'user', content: 'x' },
      { role: 'assistant', metadata: { pendingClientActions: pending } },
    ];
    expect(getPendingClientActions(messages)).toEqual(pending);
  });

  it('should return empty when no pending actions', () => {
    expect(getPendingClientActions([{ role: 'assistant', metadata: {} }])).toEqual([]);
  });
});
