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
import { LEARNING_STORE, LearningStorePort } from '../domain/ports/learning-store.port';
import { KNOWLEDGE_STATS } from '../domain/knowledge/knowledge-index';

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
      'Pipeline: RAG (45 chunks) + memória aprendida + Ollama + tools (doc_search, web_search, consult_peer_ai) → ' +
      'buscas via service-search → aprendizado persistente filtrado por ética → clientActions para o PWA.',
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
    @Optional() @Inject(LEARNING_STORE) private readonly learning?: LearningStorePort,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check do service-ai (RAG + aprendizado persistente)' })
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
        chunks: KNOWLEDGE_STATS.total,
        breakdown: {
          action: KNOWLEDGE_STATS.actionChunks,
          dev: KNOWLEDGE_STATS.devChunks,
          ethics: KNOWLEDGE_STATS.ethicsChunks,
          faith: KNOWLEDGE_STATS.faithChunks,
          pm: KNOWLEDGE_STATS.pmChunks,
        },
      },
      learning: {
        enabled: Boolean(this.learning),
        dataPath: this.config.get('LEARNING_DATA_PATH', './data/jarvis-learned-knowledge.json'),
      },
    };
  }
}
