import { describe, it, expect } from 'vitest';
import {
  isFollowUpMessage,
  isDevConversation,
  shouldPreserveContextualReply,
  trimHistoryForModel,
  buildConversationTopicSummary,
} from '../src/domain/services/conversation-context';

describe('conversation-context', () => {
  const history = [
    { id: '1', role: 'user' as const, content: 'Quais modelos você conversou?', timestamp: new Date() },
    { id: '2', role: 'assistant' as const, content: 'Conversei com Gemma2 e Mistral via Ollama.', timestamp: new Date() },
    { id: '3', role: 'user' as const, content: 'Conte mais sobre as conversas de forma detalhada.', timestamp: new Date() },
  ];

  it('should detect follow-up messages', () => {
    expect(isFollowUpMessage('Conte mais sobre as conversas de forma detalhada.', history)).toBe(true);
    expect(isFollowUpMessage('busque no google notícias de IA', history)).toBe(false);
  });

  it('should detect dev conversations from history', () => {
    const devHistory = [
      { id: '1', role: 'user' as const, content: 'Crie um projeto fullstack NestJS e Next.js', timestamp: new Date() },
    ];
    expect(isDevConversation('continue com o próximo arquivo', devHistory)).toBe(true);
  });

  it('should preserve contextual reply on follow-ups with peer_ai', () => {
    expect(
      shouldPreserveContextualReply(
        'Conte mais sobre as conversas',
        history,
        'Senhor, detalho as conversas com Gemma2…',
        ['peer_ai'],
      ),
    ).toBe(true);
  });

  it('should trim history by message window', () => {
    const long = Array.from({ length: 40 }, (_, i) => ({
      id: String(i),
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `msg ${i}`,
      timestamp: new Date(),
    }));
    expect(trimHistoryForModel(long).length).toBeLessThanOrEqual(24);
  });

  it('should build topic summary from recent messages', () => {
    const summary = buildConversationTopicSummary(history);
    expect(summary).toContain('CONTINUIDADE');
    expect(summary).toContain('Gemma2');
  });
});
