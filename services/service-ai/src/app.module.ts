import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AI_PORT, CONVERSATION_STORE, SEARCH_CLIENT } from './domain/ports/ai.port';
import { OpenAiAdapter } from './infrastructure/adapters/openai.adapter';
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
    HttpModule.register({ timeout: 15000 }),
  ],
  controllers: [ChatController, HealthController],
  providers: [
    SendMessageUseCase,
    GetConversationUseCase,
    CreateSessionUseCase,
    { provide: AI_PORT, useClass: OpenAiAdapter },
    { provide: CONVERSATION_STORE, useClass: InMemoryConversationStore },
    { provide: SEARCH_CLIENT, useClass: HttpSearchClient },
  ],
})
export class AppModule {}
