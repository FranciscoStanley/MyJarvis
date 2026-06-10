import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SendMessageRequestDto } from './dto/chat.dto';
import {
  SendMessageUseCase,
  GetConversationUseCase,
  CreateSessionUseCase,
} from '../application/use-cases/chat.use-cases';

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
  create() {
    const result = this.createSession.execute();
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  @Post('message')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar mensagem ao JARVIS' })
  @ApiResponse({ status: 200, description: 'Resposta do JARVIS' })
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
  @Get()
  check() {
    return { status: 'ok', service: 'service-ai', version: '1.0.0', uptime: process.uptime() };
  }
}
