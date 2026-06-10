import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatMessage, JarvisAction } from '@myjarvis/shared';
import { AiPort } from '../../domain/ports/ai.port';
import { JARVIS_SYSTEM_PROMPT, JARVIS_TOOLS } from '../../domain/constants/jarvis-prompt';

@Injectable()
export class OpenAiAdapter implements AiPort {
  private readonly client: OpenAI | null;
  private readonly model: string;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('OPENAI_API_KEY');
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
    this.model = config.get('OPENAI_MODEL', 'gpt-4o-mini');
  }

  async generateResponse(
    messages: ChatMessage[],
    userMessage: string,
  ): Promise<{ reply: string; actions: JarvisAction[] }> {
    if (!this.client) {
      return this.fallbackResponse(userMessage);
    }

    const history = messages.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: JARVIS_SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: userMessage },
      ],
      tools: JARVIS_TOOLS,
      tool_choice: 'auto',
      temperature: 0.8,
      max_tokens: 1500,
    });

    const choice = response.choices[0];
    const actions: JarvisAction[] = [];

    if (choice.message.tool_calls) {
      for (const call of choice.message.tool_calls) {
        const args = JSON.parse(call.function.arguments) as { query: string };
        const typeMap: Record<string, JarvisAction['type']> = {
          web_search: 'search',
          image_search: 'image',
          video_search: 'video',
          music_search: 'music',
        };
        actions.push({
          type: typeMap[call.function.name] ?? 'search',
          query: args.query,
        });
      }
    }

    const reply = choice.message.content ?? 'Desculpe, não consegui processar sua solicitação.';

    return { reply, actions };
  }

  private fallbackResponse(userMessage: string): { reply: string; actions: JarvisAction[] } {
    const lower = userMessage.toLowerCase();
    const actions: JarvisAction[] = [];

    if (lower.includes('busca') || lower.includes('pesquis')) {
      actions.push({ type: 'search', query: userMessage });
    }
    if (lower.includes('imagem') || lower.includes('foto')) {
      actions.push({ type: 'image', query: userMessage });
    }
    if (lower.includes('vídeo') || lower.includes('video')) {
      actions.push({ type: 'video', query: userMessage });
    }
    if (lower.includes('música') || lower.includes('musica')) {
      actions.push({ type: 'music', query: userMessage });
    }

    return {
      reply: `Bom dia, senhor. Recebi sua mensagem: "${userMessage}". ` +
        `Configure a OPENAI_API_KEY para ativar minha inteligência completa. ` +
        `Enquanto isso, posso ajudá-lo com buscas básicas.${actions.length ? ' Detectei ações pendentes.' : ''}`,
      actions,
    };
  }
}
