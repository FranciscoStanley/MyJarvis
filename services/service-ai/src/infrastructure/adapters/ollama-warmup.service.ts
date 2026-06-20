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

    this.logger.log(`Pré-carregando modelo ${model} no Ollama...`);

    try {
      await firstValueFrom(
        this.http.post(
          `${baseUrl}/api/chat`,
          {
            model,
            messages: [{ role: 'user', content: 'ok' }],
            stream: false,
            options: { num_predict: 1 },
          },
          { timeout: 180_000 },
        ),
      );
      this.logger.log(`Modelo ${model} pronto.`);
    } catch (err) {
      this.logger.warn(
        `Warmup do Ollama falhou (o modelo será carregado na primeira mensagem): ${(err as Error).message}`,
      );
    }
  }
}
