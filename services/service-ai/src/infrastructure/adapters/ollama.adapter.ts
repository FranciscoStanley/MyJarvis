import { Injectable, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ChatMessage, JarvisAction, SearchResult } from '@myjarvis/shared';
import { AiPort } from '../../domain/ports/ai.port';
import { RAG_PORT, RagPort } from '../../domain/ports/rag.port';
import { JARVIS_SYSTEM_PROMPT, JARVIS_TOOLS, JARVIS_SYNTHESIS_PROMPT, JARVIS_DOC_SYNTHESIS_PROMPT } from '../../domain/constants/jarvis-prompt';
import { buildActionAcknowledgement } from '../../domain/services/action-intent';
import { detectActionsFromText } from './action-detector';

interface OllamaMessage {
  role: string;
  content: string;
  tool_calls?: { function: { name: string; arguments: Record<string, string> } }[];
}

@Injectable()
export class OllamaAdapter implements AiPort {
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly chatTimeoutMs: number;
  private readonly synthesisTimeoutMs: number;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
    @Optional() @Inject(RAG_PORT) private readonly rag?: RagPort,
  ) {
    this.baseUrl = config.get('OLLAMA_BASE_URL', 'http://localhost:11434');
    this.model = config.get('OLLAMA_MODEL', 'llama3.2');
    this.chatTimeoutMs = Number(config.get('OLLAMA_TIMEOUT_MS', 180_000));
    this.synthesisTimeoutMs = Number(config.get('OLLAMA_SYNTHESIS_TIMEOUT_MS', 120_000));
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

      const systemPrompt = await this.buildSystemPrompt(userMessage);

      const { data } = await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/api/chat`,
          {
            model: this.model,
            messages: [
              { role: 'system', content: systemPrompt },
              ...history,
              { role: 'user', content: userMessage },
            ],
            tools: JARVIS_TOOLS,
            stream: false,
            options: { temperature: 0.85 },
          },
          { timeout: this.chatTimeoutMs },
        ),
      );

      const msg = data.message as OllamaMessage;
      const actions = this.extractActions(msg);
      const detected = actions.length ? actions : detectActionsFromText(userMessage);
      const reply = this.resolveReply(msg, detected, userMessage);

      return { reply, actions: detected };
    } catch {
      return this.offlineResponse(userMessage);
    }
  }

  async synthesizeWithResults(
    userMessage: string,
    searchResults: SearchResult[],
    actionTypes: string[],
  ): Promise<string> {
    const resultsContext = searchResults
      .slice(0, 5)
      .map((r, i) => `${i + 1}. ${r.title}\n   URL: ${r.url}\n   ${r.snippet}`)
      .join('\n\n');

    const prompt = actionTypes.includes('docs')
      ? `${JARVIS_DOC_SYNTHESIS_PROMPT}

Pedido do usuário: "${userMessage}"

Resultados da documentação:
${resultsContext}

Formule uma resposta técnica clara como JARVIS em português brasileiro (pt-BR).`
      : `${JARVIS_SYNTHESIS_PROMPT}

Pedido do usuário: "${userMessage}"
Tipo de busca: ${actionTypes.join(', ') || 'geral'}

Resultados encontrados:
${resultsContext}

Formule uma resposta natural como JARVIS em português brasileiro (pt-BR). Mencione o resultado mais relevante. Não liste URLs cruas.`;

    try {
      const { data } = await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/api/chat`,
          {
            model: this.model,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
            options: { temperature: 0.75 },
          },
          { timeout: this.synthesisTimeoutMs },
        ),
      );

      const content = (data.message as OllamaMessage)?.content?.trim();
      return content || '';
    } catch {
      return '';
    }
  }

  private async buildSystemPrompt(userMessage: string): Promise<string> {
    if (!this.rag) return JARVIS_SYSTEM_PROMPT;
    try {
      const context = await this.rag.retrieve(userMessage);
      if (context) {
        return `${JARVIS_SYSTEM_PROMPT}\n\n--- CONTEXTO RAG (capacidades e exemplos) ---\n${context}`;
      }
    } catch {
      /* fallback to base prompt */
    }
    return JARVIS_SYSTEM_PROMPT;
  }

  private resolveReply(msg: OllamaMessage, actions: JarvisAction[], userMessage: string): string {
    const content = msg.content?.trim();
    if (content && !/^desculpe,?\s+n[aã]o consegui/i.test(content)) return content;
    if (actions.length) return buildActionAcknowledgement(actions, userMessage);
    return content || 'Desculpe, não consegui formular uma resposta.';
  }

  /** Ollama às vezes devolve URL como JSON serializado em string. */
  private normalizeActionUrl(url: unknown): string {
    if (typeof url !== 'string' || !url.trim()) return '';
    const trimmed = url.trim();
    if (!trimmed.startsWith('{')) return trimmed;
    try {
      const parsed = JSON.parse(trimmed) as { url?: string };
      return typeof parsed.url === 'string' ? parsed.url : '';
    } catch {
      return '';
    }
  }

  private extractActions(msg: OllamaMessage): JarvisAction[] {
    if (!msg.tool_calls?.length) return [];

    const typeMap: Record<string, JarvisAction['type']> = {
      doc_search: 'docs',
      web_search: 'search',
      image_search: 'image',
      video_search: 'video',
      music_search: 'music',
      open_url: 'open_url',
      open_application: 'open_app',
    };

    return msg.tool_calls.map((call) => {
      const raw = call.function.arguments;
      const args = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const type = typeMap[call.function.name] ?? 'search';
      if (type === 'docs') {
        return {
          type: 'docs',
          query: args?.topic ?? String(raw),
          data: { technology: args?.technology },
        };
      }
      if (type === 'open_url' || type === 'open_app') {
        const url = this.normalizeActionUrl(args?.url);
        return {
          type,
          data: {
            url: url || undefined,
            app: args?.app,
            label: args?.label,
            description: args?.description,
          },
        };
      }
      return {
        type,
        query: args?.query ?? String(raw),
      };
    });
  }

  private offlineResponse(userMessage: string): { reply: string; actions: JarvisAction[] } {
    const actions = detectActionsFromText(userMessage);
    const hasActions = actions.length > 0;

    return {
      reply: hasActions
        ? buildActionAcknowledgement(actions, userMessage)
        : `Senhor, o serviço Ollama não respondeu. Verifique se está em execução: docker compose up ollama && docker exec myjarvis-ollama-1 ollama pull ${this.model}.`,
      actions,
    };
  }
}
