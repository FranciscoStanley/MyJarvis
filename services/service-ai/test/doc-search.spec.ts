import { describe, it, expect } from 'vitest';
import {
  buildDocSearchQuery,
  detectTechnologyFromText,
  extractDocTopic,
  isDocumentationRequest,
  resolveDocEntry,
} from '../src/domain/services/doc-search';

describe('doc-search', () => {
  it('should resolve NestJS from alias', () => {
    expect(resolveDocEntry('nest')?.id).toBe('nestjs');
    expect(resolveDocEntry('NestJS')?.domain).toBe('docs.nestjs.com');
  });

  it('should resolve Python and .NET', () => {
    expect(resolveDocEntry('python')?.id).toBe('python');
    expect(resolveDocEntry('c#')?.id).toBe('dotnet');
  });

  it('should build site-restricted query for known technology', () => {
    const query = buildDocSearchQuery({ technology: 'nestjs', topic: 'guards authentication' });
    expect(query).toBe('site:docs.nestjs.com guards authentication');
  });

  it('should fallback to official documentation query for unknown tech', () => {
    const query = buildDocSearchQuery({ technology: 'Bun', topic: 'runtime API' });
    expect(query).toBe('Bun official documentation runtime API');
  });

  it('should detect technology from user text', () => {
    expect(detectTechnologyFromText('como usar guards no NestJS')).toBe('NestJS');
    expect(detectTechnologyFromText('documentação do Python asyncio')).toBe('Python');
  });

  it('should extract doc topic from Portuguese request', () => {
    const topic = extractDocTopic('busque na documentação do NestJS sobre guards', 'NestJS');
    expect(topic.toLowerCase()).toMatch(/guards/);
  });

  it('should identify documentation requests', () => {
    expect(isDocumentationRequest('documentação oficial do Next.js sobre App Router')).toBe(true);
    expect(isDocumentationRequest('como configurar guards no NestJS')).toBe(true);
    expect(isDocumentationRequest('toque música gospel')).toBe(false);
  });
});
