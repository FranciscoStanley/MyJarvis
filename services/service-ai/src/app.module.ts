import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AI_PORT, CONVERSATION_STORE, SEARCH_CLIENT } from './domain/ports/ai.port';
import { RAG_PORT } from './domain/ports/rag.port';
import { OllamaAdapter } from './infrastructure/adapters/ollama.adapter';
import { OllamaRagAdapter } from './infrastructure/adapters/ollama-rag.adapter';
import { OllamaWarmupService } from './infrastructure/adapters/ollama-warmup.service';
import { InMemoryConversationStore, HttpSearchClient } from './infrastructure/adapters/memory-store.adapter';
import {
  SendMessageUseCase,
  GetConversationUseCase,
  CreateSessionUseCase,
} from './application/use-cases/chat.use-cases';
import { ChatController, HealthController } from './presentation/chat.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({ timeout: 120_000 }),
  ],
  controllers: [ChatController, HealthController],
  providers: [
    SendMessageUseCase,
    GetConversationUseCase,
    CreateSessionUseCase,
    { provide: AI_PORT, useClass: OllamaAdapter },
    { provide: RAG_PORT, useClass: OllamaRagAdapter },
    { provide: CONVERSATION_STORE, useClass: InMemoryConversationStore },
    { provide: SEARCH_CLIENT, useClass: HttpSearchClient },
    OllamaWarmupService,
  ],
})
export class AppModule {}
