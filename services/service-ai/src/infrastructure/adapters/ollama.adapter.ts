import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ChatMessage, JarvisAction } from '@myjarvis/shared';
import { AiPort } from '../../domain/ports/ai.port';
import { JARVIS_SYSTEM_PROMPT, JARVIS_TOOLS } from '../../domain/constants/jarvis-prompt';

interface OllamaMessage {
  role: string;
  content: string;
  tool_calls?: { function: { name: string; arguments: Record<string, string> } }[];
}

@Injectable()
export class OllamaAdapter implements AiPort {
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl = config.get('OLLAMA_BASE_URL', 'http://localhost:11434');
    this.model = config.get('OLLAMA_MODEL', 'llama3.2');
  }

  async generateResponse(
    messages: ChatMessage[],
    userMessage: string,
  ): Promise<{ reply: string; actions: JarvisAction[] }> {
    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data } = await firstValueFrom(
        this.http.post(`${this.baseUrl}/api/chat`, {
          model: this.model,
          messages: [
            { role: 'system', content: JARVIS_SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: userMessage },
          ],
          tools: JARVIS_TOOLS,
          stream: false,
          options: { temperature: 0.8 },
        }),
      );

      const msg = data.message as OllamaMessage;
      const actions = this.extractActions(msg);
      const reply = msg.content?.trim() || 'Desculpe, não consegui formular uma resposta.';

      return { reply, actions: actions.length ? actions : this.detectActionsFromText(userMessage) };
    } catch {
      return this.offlineResponse(userMessage);
    }
  }

  private extractActions(msg: OllamaMessage): JarvisAction[] {
    if (!msg.tool_calls?.length) return [];

    const typeMap: Record<string, JarvisAction['type']> = {
      web_search: 'search',
      image_search: 'image',
      video_search: 'video',
      music_search: 'music',
    };

    return msg.tool_calls.map((call) => ({
      type: typeMap[call.function.name] ?? 'search',
      query: call.function.arguments?.query ?? call.function.arguments,
    })) as JarvisAction[];
  }

  private detectActionsFromText(text: string): JarvisAction[] {
    const lower = text.toLowerCase();
    const actions: JarvisAction[] = [];
    const query = text.replace(/^(jarvis,?\s*|busque?\s+|pesquise?\s+|procure?\s+)/i, '').trim() || text;

    if (/busca|pesquis|notícia|informaç|internet|web/.test(lower)) {
      actions.push({ type: 'search', query });
    }
    if (/imagem|foto|picture/.test(lower)) {
      actions.push({ type: 'image', query });
    }
    if (/vídeo|video|youtube/.test(lower)) {
      actions.push({ type: 'video', query });
    }
    if (/música|musica|som|tocar|playlist/.test(lower)) {
      actions.push({ type: 'music', query });
    }
    return actions;
  }

  private offlineResponse(userMessage: string): { reply: string; actions: JarvisAction[] } {
    const actions = this.detectActionsFromText(userMessage);
    return {
      reply:
        `Bom dia, senhor. O serviço Ollama não está disponível no momento. ` +
        `Inicie com: docker compose up ollama && docker exec myjarvis-ollama-1 ollama pull ${this.model}. ` +
        `Posso ainda executar buscas básicas enquanto isso.`,
      actions,
    };
  }
}
