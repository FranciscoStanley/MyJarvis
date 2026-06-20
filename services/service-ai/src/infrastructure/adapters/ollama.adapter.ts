import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ChatMessage, JarvisAction, SearchResult } from '@myjarvis/shared';
import { AiPort } from '../../domain/ports/ai.port';
import { ContextEnrichmentService } from '../../application/services/context-enrichment.service';
import {
  JARVIS_SYSTEM_PROMPT,
  JARVIS_EXTENDED_PROMPT,
  JARVIS_TOOLS,
  JARVIS_SYNTHESIS_PROMPT,
  JARVIS_DOC_SYNTHESIS_PROMPT,
} from '../../domain/constants/jarvis-prompt';
import { needsExtendedPrompt, shouldAttachTools } from '../../domain/services/prompt-strategy';
import { buildActionAcknowledgement } from '../../domain/services/action-intent';
import { detectActionsFromText } from './action-detector';

interface OllamaMessage {
  role: string;
  content: string;
  tool_calls?: { function: { name: string; arguments: Record<string, string> } }[];
}

@Injectable()
export class OllamaAdapter implements AiPort {
  private readonly logger = new Logger(OllamaAdapter.name);
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly chatTimeoutMs: number;
  private readonly synthesisTimeoutMs: number;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
    @Optional() private readonly contextEnrichment?: ContextEnrichmentService,
  ) {
    this.baseUrl = config.get('OLLAMA_BASE_URL', 'http://localhost:11434');
    this.model = config.get('OLLAMA_MODEL', 'llama3.2');
    this.chatTimeoutMs = Number(config.get('OLLAMA_TIMEOUT_MS', 360_000));
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
      const extendedPrompt = needsExtendedPrompt(userMessage);
      const payload: Record<string, unknown> = {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: userMessage },
        ],
        stream: false,
        options: { temperature: 0.85, num_predict: extendedPrompt ? 512 : 192 },
      };
      if (shouldAttachTools(userMessage)) {
        payload.tools = JARVIS_TOOLS;
      }

      const { data } = await firstValueFrom(
        this.http.post(`${this.baseUrl}/api/chat`, payload, { timeout: this.chatTimeoutMs }),
      );

      const msg = data.message as OllamaMessage;
      const actions = this.extractActions(msg);
      const detected = actions.length ? actions : detectActionsFromText(userMessage);
      const reply = this.resolveReply(msg, detected, userMessage);

      return { reply, actions: detected };
    } catch (err) {
      this.logger.warn(`Ollama chat falhou: ${(err as Error).message}`);
      return this.offlineResponse(userMessage, err);
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
      const synthesisMaxTokens = actionTypes.includes('docs') ? 420 : 220;
      const { data } = await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/api/chat`,
          {
            model: this.model,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
            options: { temperature: 0.75, num_predict: synthesisMaxTokens },
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
    const sections = [JARVIS_SYSTEM_PROMPT];
    if (needsExtendedPrompt(userMessage)) {
      sections.push(JARVIS_EXTENDED_PROMPT);
    }
    if (this.contextEnrichment) {
      try {
        const context = await this.contextEnrichment.buildEnrichedContext(userMessage);
        if (context) sections.push(context);
      } catch {
        /* fallback to base prompt */
      }
    }
    return sections.join('\n\n');
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
      consult_peer_ai: 'peer_ai',
    };

    return msg.tool_calls.map((call) => {
      const raw = call.function.arguments;
      const args = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const type = typeMap[call.function.name] ?? 'search';
      if (type === 'peer_ai') {
        return {
          type: 'peer_ai',
          query: args?.question ?? String(raw),
          data: { peerId: args?.peer ?? args?.peerId ?? 'mistral', context: args?.context },
        };
      }
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

  private offlineResponse(
    userMessage: string,
    err?: unknown,
  ): { reply: string; actions: JarvisAction[] } {
    const actions = detectActionsFromText(userMessage);
    const hasActions = actions.length > 0;
    const message = (err as Error)?.message?.toLowerCase() ?? '';
    const timedOut = message.includes('timeout') || message.includes('timed out');

    const fallback = timedOut
      ? `Senhor, o Ollama demorou além do limite (${Math.round(this.chatTimeoutMs / 1000)}s) — comum em CPU sem GPU na primeira inferência. Aguarde e tente novamente; se persistir: docker compose restart ollama service-ai.`
      : `Senhor, o serviço Ollama não respondeu. Verifique se está em execução: docker compose up ollama && docker exec myjarvis-ollama-1 ollama pull ${this.model}.`;

    return {
      reply: hasActions ? buildActionAcknowledgement(actions, userMessage) : fallback,
      actions,
    };
  }
}
