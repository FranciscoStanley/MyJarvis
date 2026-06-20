import { Controller, Post, Get, Body, Param, Inject, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SendMessageRequestDto } from './dto/chat.dto';
import {
  SendMessageResponseDto,
  SessionResponseDto,
  HealthResponseDto,
} from './dto/chat-response.dto';
import {
  SendMessageUseCase,
  GetConversationUseCase,
  CreateSessionUseCase,
} from '../application/use-cases/chat.use-cases';
import { RAG_PORT, RagPort } from '../domain/ports/rag.port';
import { ACTION_KNOWLEDGE_CHUNKS } from '../domain/knowledge/action-knowledge';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly sendMessage: SendMessageUseCase,
    private readonly getConversation: GetConversationUseCase,
    private readonly createSession: CreateSessionUseCase,
  ) {}

  @Post('session')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova sessão de conversa' })
  @ApiResponse({ status: 201, description: 'Sessão criada', type: SessionResponseDto })
  create() {
    const result = this.createSession.execute();
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  @Post('message')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enviar mensagem ao JARVIS',
    description:
      'Pipeline: RAG recupera contexto de ações → Ollama responde + tool calls → buscas via service-search → ' +
      'clientActions para o PWA (YouTube, Google, navegador, Spotify). Comandos imperativos (abra, toque, entre) ' +
      'retornam requiresConfirmation=false para execução imediata via window.open.',
  })
  @ApiResponse({ status: 200, description: 'Resposta do JARVIS com ações opcionais', type: SendMessageResponseDto })
  async message(@Body() dto: SendMessageRequestDto) {
    const result = await this.sendMessage.execute(dto);
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  @Get('session/:sessionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter histórico da conversa' })
  history(@Param('sessionId') sessionId: string) {
    const messages = this.getConversation.execute(sessionId);
    return { success: true, data: { sessionId, messages }, timestamp: new Date().toISOString() };
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly config: ConfigService,
    @Optional() @Inject(RAG_PORT) private readonly rag?: RagPort,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check do service-ai (inclui status RAG)' })
  @ApiResponse({ status: 200, type: HealthResponseDto })
  check(): HealthResponseDto {
    return {
      status: 'ok',
      service: 'service-ai',
      version: '1.0.0',
      uptime: process.uptime(),
      rag: {
        ready: this.rag?.isReady() ?? false,
        embedModel: this.config.get('OLLAMA_EMBED_MODEL', 'nomic-embed-text'),
        chunks: ACTION_KNOWLEDGE_CHUNKS.length,
      },
    };
  }
}
