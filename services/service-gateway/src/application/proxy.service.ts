import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

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
    const url = `${this.serviceUrls[service]}${path}`;
    const response = await firstValueFrom(
      this.http.request({
        method,
        url,
        data: body,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }),
    );
    return response.data;
  }
}
