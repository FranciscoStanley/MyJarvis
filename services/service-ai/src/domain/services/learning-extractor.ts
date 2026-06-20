import { SearchResult } from '@myjarvis/shared';
import { LearnedEntryInput } from '../entities/learned-entry.entity';
import { extractKeywords, inferLearningCategory } from './learning-validator';

export interface LearningExtractionInput {
  userMessage: string;
  synthesizedReply: string;
  searchResults?: SearchResult[];
  actionTypes?: string[];
  peerInsight?: string;
}

/** Indica se a troca merece persistência como aprendizado. */
export function shouldPersistLearning(input: LearningExtractionInput): boolean {
  const lower = input.userMessage.toLowerCase();

  if (/\b(aprenda|guarde|memorize|salve\s+isso|lembre\s+disso|anote\s+isso)\b/i.test(lower)) {
    return input.synthesizedReply.trim().length >= 40;
  }

  if (input.searchResults?.length && input.synthesizedReply.trim().length >= 80) {
    return true;
  }

  if (input.peerInsight && input.peerInsight.trim().length >= 60) {
    return true;
  }

  if (/\b(lição\s+aprendida|documente|registre\s+o\s+conhecimento)\b/i.test(lower)) {
    return true;
  }

  return false;
}

export function buildLearningCandidate(input: LearningExtractionInput): LearnedEntryInput | null {
  if (!shouldPersistLearning(input)) return null;

  const lower = input.userMessage.toLowerCase();
  const explicit = /\b(aprenda|guarde|memorize|salve|lembre|anote)\b/i.test(lower);

  let topic = input.userMessage.slice(0, 120).trim();
  if (input.searchResults?.[0]?.title) {
    topic = input.searchResults[0].title.slice(0, 120);
  }

  let summary = input.synthesizedReply.trim();
  if (input.peerInsight) {
    summary = `${summary}\n\nInsight peer: ${input.peerInsight.trim()}`.slice(0, 1800);
  }

  const source = input.peerInsight
    ? 'peer_ai'
    : input.searchResults?.length
      ? input.actionTypes?.includes('docs')
        ? 'doc_search'
        : 'web_search'
      : explicit
        ? 'user_explicit'
        : 'conversation';

  const keywords = extractKeywords(
    `${topic} ${summary} ${input.searchResults?.map((r) => r.title).join(' ') ?? ''}`,
  );

  return {
    topic,
    summary,
    keywords,
    category: inferLearningCategory(input.userMessage, input.actionTypes),
    source,
    sourceQuery: input.userMessage.slice(0, 256),
    confidence: input.searchResults?.length ? 0.85 : explicit ? 0.9 : 0.7,
  };
}
