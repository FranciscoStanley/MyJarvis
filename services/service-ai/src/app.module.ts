import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AI_PORT, CONVERSATION_STORE, SEARCH_CLIENT } from './domain/ports/ai.port';
import { RAG_PORT } from './domain/ports/rag.port';
import { LEARNING_STORE } from './domain/ports/learning-store.port';
import { PEER_AI } from './domain/ports/peer-ai.port';
import { OllamaAdapter } from './infrastructure/adapters/ollama.adapter';
import { OllamaRagAdapter } from './infrastructure/adapters/ollama-rag.adapter';
import { OllamaWarmupService } from './infrastructure/adapters/ollama-warmup.service';
import { FileLearningStoreAdapter } from './infrastructure/adapters/file-learning-store.adapter';
import { OllamaPeerAdapter } from './infrastructure/adapters/ollama-peer.adapter';
import { FileConversationStoreAdapter } from './infrastructure/adapters/file-conversation-store.adapter';
import { HttpSearchClient } from './infrastructure/adapters/memory-store.adapter';
import { ContextEnrichmentService } from './application/services/context-enrichment.service';
import {
  SendMessageUseCase,
  GetConversationUseCase,
  CreateSessionUseCase,
  ListSessionsUseCase,
  DeleteSessionUseCase,
} from './application/use-cases/chat.use-cases';
import {
  PersistLearningUseCase,
  GetLearningStatsUseCase,
  RecallLearningUseCase,
} from './application/use-cases/learning.use-cases';
import { ChatController, HealthController } from './presentation/chat.controller';
import { LearningController } from './presentation/learning.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        timeout: Number(config.get('OLLAMA_TIMEOUT_MS', 360_000)) + 30_000,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatController, HealthController, LearningController],
  providers: [
    SendMessageUseCase,
    GetConversationUseCase,
    CreateSessionUseCase,
    ListSessionsUseCase,
    DeleteSessionUseCase,
    PersistLearningUseCase,
    GetLearningStatsUseCase,
    RecallLearningUseCase,
    ContextEnrichmentService,
    { provide: AI_PORT, useClass: OllamaAdapter },
    { provide: RAG_PORT, useClass: OllamaRagAdapter },
    { provide: LEARNING_STORE, useClass: FileLearningStoreAdapter },
    { provide: PEER_AI, useClass: OllamaPeerAdapter },
    { provide: CONVERSATION_STORE, useClass: FileConversationStoreAdapter },
    { provide: SEARCH_CLIENT, useClass: HttpSearchClient },
    OllamaWarmupService,
  ],
})
export class AppModule {}
