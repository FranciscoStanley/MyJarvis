import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { sanitizeProxyPath } from '@myjarvis/nest-security';

export type ServiceName =
  | 'auth'
  | 'ai'
  | 'voice'
  | 'search'
  | 'notifications'
  | 'media';

@Injectable()
export class ProxyService {
  private readonly serviceUrls: Record<ServiceName, string>;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.serviceUrls = {
      auth: config.get('AUTH_SERVICE_URL', 'http://localhost:3001'),
      ai: config.get('AI_SERVICE_URL', 'http://localhost:3002'),
      voice: config.get('VOICE_SERVICE_URL', 'http://localhost:3003'),
      search: config.get('SEARCH_SERVICE_URL', 'http://localhost:3004'),
      notifications: config.get('NOTIFICATIONS_SERVICE_URL', 'http://localhost:3005'),
      media: config.get('MEDIA_SERVICE_URL', 'http://localhost:3006'),
    };
  }

  getServiceUrl(service: ServiceName): string {
    return this.serviceUrls[service];
  }

  async forward(
    service: ServiceName,
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ) {
    const safePath = sanitizeProxyPath(path);
    const base = this.serviceUrls[service].replace(/\/$/, '');
    const url = `${base}${safePath}`;

    if (!url.startsWith(base)) {
      throw new BadRequestException('Destino de proxy inválido');
    }

    const response = await firstValueFrom(
      this.http.request({
        method,
        url,
        data: body,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        maxRedirects: 0,
        timeout: 30_000,
        validateStatus: (status) => status < 500,
      }),
    );

    if (response.status >= 400) {
      const err = new Error('Upstream error') as Error & {
        response?: { status: number; data: unknown };
      };
      err.response = { status: response.status, data: response.data };
      throw err;
    }

    return response.data;
  }
}
