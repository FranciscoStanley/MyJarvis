import { describe, it, expect } from 'vitest';
import { isExplicitExecuteCommand, buildActionAcknowledgement } from '../src/domain/services/action-intent';

describe('isExplicitExecuteCommand', () => {
  it('should detect imperative open commands', () => {
    expect(isExplicitExecuteCommand('Abra o YouTube')).toBe(true);
    expect(isExplicitExecuteCommand('toque a música X')).toBe(true);
    expect(isExplicitExecuteCommand('preciso que abra o navegador')).toBe(true);
  });

  it('should not detect casual questions', () => {
    expect(isExplicitExecuteCommand('qual é a capital da França?')).toBe(false);
  });
});

describe('buildActionAcknowledgement', () => {
  it('should acknowledge video search', () => {
    const reply = buildActionAcknowledgement([{ type: 'video', query: 'Espírito Santo' }], 'toque Espírito Santo');
    expect(reply).toContain('Espírito Santo');
  });

  it('should acknowledge open actions', () => {
    const reply = buildActionAcknowledgement([{ type: 'open_app' }], 'abra youtube');
    expect(reply).toContain('Abrindo');
  });

  it('should acknowledge docs search', () => {
    const reply = buildActionAcknowledgement(
      [{ type: 'docs', query: 'guards', data: { technology: 'NestJS' } }],
      'documentação nestjs guards',
    );
    expect(reply).toContain('NestJS');
  });
});
