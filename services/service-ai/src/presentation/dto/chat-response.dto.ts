import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClientActionDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ enum: ['open_url', 'open_app', 'play_embed'] })
  type!: 'open_url' | 'open_app' | 'play_embed';

  @ApiProperty({ example: 'Abrir no YouTube' })
  label!: string;

  @ApiProperty({ example: 'Abrir «Espírito Santo» no YouTube' })
  description!: string;

  @ApiProperty({ example: 'https://www.youtube.com/watch?v=abc123' })
  url!: string;

  @ApiPropertyOptional({ enum: ['youtube', 'spotify', 'gmail', 'browser'] })
  app?: 'youtube' | 'spotify' | 'gmail' | 'browser';

  @ApiProperty({
    description:
      'false = execução imediata no navegador (comandos imperativos: abra, toque, entre). true = aguarda confirmação (sim/não ou botão na UI).',
    example: false,
  })
  requiresConfirmation!: boolean;
}

export class SearchResultDto {
  @ApiProperty({ example: 'Espírito Santo — vídeo' })
  title!: string;

  @ApiProperty({ example: 'https://www.youtube.com/watch?v=abc123' })
  url!: string;

  @ApiProperty({ example: 'Música gospel encontrada no YouTube.' })
  snippet!: string;

  @ApiProperty({ enum: ['web', 'video', 'music', 'image'] })
  type!: string;
}

export class JarvisActionDto {
  @ApiProperty({
    enum: ['search', 'docs', 'image', 'video', 'music', 'open_url', 'open_app', 'peer_ai', 'notification', 'speak'],
  })
  type!: string;

  @ApiPropertyOptional({ example: 'inteligência artificial' })
  query?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  data?: Record<string, unknown>;
}

export class SendMessageResponseDto {
  @ApiProperty({
    example: 'Certamente, senhor. Localizando «Espírito Santo» para reproduzir.',
    description: 'Resposta conversacional JARVIS (sintetizada com RAG + resultados de busca)',
  })
  reply!: string;

  @ApiProperty({ example: 'session-uuid' })
  sessionId!: string;

  @ApiPropertyOptional({ type: [JarvisActionDto], description: 'Ações internas detectadas pelo LLM ou fallback' })
  actions?: JarvisActionDto[];

  @ApiPropertyOptional({ type: [SearchResultDto], description: 'Resultados quando houve busca web/vídeo/música' })
  searchResults?: SearchResultDto[];

  @ApiPropertyOptional({
    type: [ClientActionDto],
    description:
      'Ações executáveis no cliente (PWA). Com requiresConfirmation=false o frontend chama window.open imediatamente.',
  })
  clientActions?: ClientActionDto[];
}

export class SessionResponseDto {
  @ApiProperty({ example: 'session-uuid' })
  sessionId!: string;
}

export class ConversationSessionSummaryDto {
  @ApiProperty({ example: 'session-uuid' })
  id!: string;

  @ApiProperty({ example: 'user-uuid' })
  userId!: string;

  @ApiProperty({ example: 'Como configurar o Docker?' })
  title!: string;

  @ApiProperty({ example: '2026-06-22T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-06-22T12:05:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ example: 4 })
  messageCount!: number;

  @ApiPropertyOptional({ example: 'Certamente, senhor. O Docker Compose...' })
  preview?: string;
}

export class ChatMessageDto {
  @ApiProperty({ example: 'msg-uuid' })
  id!: string;

  @ApiProperty({ enum: ['user', 'assistant', 'system'] })
  role!: string;

  @ApiProperty({ example: 'Olá JARVIS' })
  content!: string;

  @ApiProperty({ example: '2026-06-22T12:00:00.000Z' })
  timestamp!: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  metadata?: Record<string, unknown>;
}

export class ConversationHistoryResponseDto {
  @ApiProperty({ example: 'session-uuid' })
  sessionId!: string;

  @ApiProperty({ type: [ChatMessageDto] })
  messages!: ChatMessageDto[];
}

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: 'service-ai' })
  service!: string;

  @ApiProperty({ example: '1.0.0' })
  version!: string;

  @ApiProperty({ example: 123.45 })
  uptime!: number;

  @ApiPropertyOptional({
    description: 'Status do índice RAG (embeddings Ollama ou fallback por keywords)',
    example: {
      ready: true,
      embedModel: 'nomic-embed-text',
      chunks: 45,
      breakdown: { action: 11, dev: 17, ethics: 5, faith: 5, pm: 7 },
    },
  })
  rag?: {
    ready: boolean;
    embedModel: string;
    chunks: number;
    breakdown?: { action: number; dev: number; ethics: number; faith: number; pm: number };
  };

  @ApiPropertyOptional({
    description: 'Memória de aprendizado persistente (filtrada por ética)',
    example: { enabled: true, dataPath: './data/jarvis-learned-knowledge.json' },
  })
  learning?: { enabled: boolean; dataPath: string };
}
