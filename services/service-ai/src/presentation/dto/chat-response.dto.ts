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
    enum: ['search', 'image', 'video', 'music', 'open_url', 'open_app', 'notification', 'speak'],
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
    example: { ready: true, embedModel: 'nomic-embed-text', chunks: 32 },
  })
  rag?: { ready: boolean; embedModel: string; chunks: number };
}
