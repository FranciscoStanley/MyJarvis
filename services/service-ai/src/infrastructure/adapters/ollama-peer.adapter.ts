import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PeerAiPort, PeerConsultInput, PeerConsultResult } from '../../domain/ports/peer-ai.port';

@Injectable()
export class OllamaPeerAdapter implements PeerAiPort {
  private readonly logger = new Logger(OllamaPeerAdapter.name);
  private readonly peers: Map<string, { baseUrl: string; model: string }>;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.peers = this.parsePeers(config);
    if (this.peers.size) {
      this.logger.log(`Peer AIs configurados: ${[...this.peers.keys()].join(', ')}`);
    }
  }

  listPeers(): string[] {
    return [...this.peers.keys()];
  }

  async consult(input: PeerConsultInput): Promise<PeerConsultResult> {
    const peer = this.peers.get(input.peerId.toLowerCase());
    if (!peer) {
      return {
        peerId: input.peerId,
        model: '',
        answer: '',
        available: false,
      };
    }

    const prompt = input.context
      ? `Contexto:\n${input.context}\n\nPergunta:\n${input.question}\n\nResponda de forma técnica e concisa em português brasileiro.`
      : `${input.question}\n\nResponda de forma técnica e concisa em português brasileiro.`;

    try {
      const { data } = await firstValueFrom(
        this.http.post(
          `${peer.baseUrl}/api/chat`,
          {
            model: peer.model,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
            options: { temperature: 0.6 },
          },
          { timeout: 120_000 },
        ),
      );

      const answer = (data?.message?.content as string | undefined)?.trim() ?? '';
      return {
        peerId: input.peerId,
        model: peer.model,
        answer,
        available: Boolean(answer),
      };
    } catch (err) {
      this.logger.warn(`Peer ${input.peerId} indisponível: ${(err as Error).message}`);
      return { peerId: input.peerId, model: peer.model, answer: '', available: false };
    }
  }

  private parsePeers(config: ConfigService): Map<string, { baseUrl: string; model: string }> {
    const map = new Map<string, { baseUrl: string; model: string }>();
    const defaultBase = config.get('OLLAMA_BASE_URL', 'http://localhost:11434');

    const models = (config.get('OLLAMA_PEER_MODELS', 'mistral,gemma2') as string)
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    for (const model of models) {
      map.set(model.toLowerCase(), { baseUrl: defaultBase, model });
    }

    const remote = (config.get('OLLAMA_PEER_URLS', '') as string)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const entry of remote) {
      const [id, url, model] = entry.split('|').map((p) => p.trim());
      if (id && url && model) {
        map.set(id.toLowerCase(), { baseUrl: url, model });
      }
    }

    return map;
  }
}
