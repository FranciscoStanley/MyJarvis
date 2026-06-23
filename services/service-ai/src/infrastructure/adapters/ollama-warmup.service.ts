import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OllamaWarmupService implements OnModuleInit {
  private readonly logger = new Logger(OllamaWarmupService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    void this.warmup();
  }

  private async warmup() {
    const baseUrl = this.config.get('OLLAMA_BASE_URL', 'http://localhost:11434');
    const model = this.config.get('OLLAMA_MODEL', 'llama3.2');
    const embedModel = this.config.get('OLLAMA_EMBED_MODEL', 'nomic-embed-text');
    const warmupTimeoutMs = Number(this.config.get('OLLAMA_WARMUP_TIMEOUT_MS', 240_000));

    this.logger.log(`Pré-carregando modelos ${model} e ${embedModel} no Ollama...`);

    try {
      await Promise.all([
        firstValueFrom(
          this.http.post(
            `${baseUrl}/api/chat`,
            {
              model,
              messages: [{ role: 'user', content: 'ok' }],
              stream: false,
              keep_alive: '15m',
              options: { num_predict: 1, num_ctx: 512 },
            },
            { timeout: warmupTimeoutMs },
          ),
        ),
        firstValueFrom(
          this.http.post(
            `${baseUrl}/api/embeddings`,
            { model: embedModel, prompt: 'warmup' },
            { timeout: warmupTimeoutMs },
          ),
        ),
      ]);
      this.logger.log(`Modelos ${model} e ${embedModel} prontos.`);
    } catch (err) {
      this.logger.warn(
        `Warmup do Ollama falhou (modelos serão carregados na primeira mensagem): ${(err as Error).message}`,
      );
    }
  }
}
