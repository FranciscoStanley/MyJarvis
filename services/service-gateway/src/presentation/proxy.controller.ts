import {
  Controller,
  All,
  Req,
  Body,
  Headers,
  Param,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ProxyService, ServiceName } from '../application/proxy.service';

const VALID_SERVICES: ServiceName[] = [
  'auth', 'ai', 'voice', 'search', 'notifications', 'media',
];

@ApiTags('Proxy')
@Controller()
export class ProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @All('auth/*')
  @ApiOperation({ summary: 'Proxy para service-auth' })
  async proxyAuth(@Req() req: Request, @Body() body: unknown, @Headers() headers: Record<string, string>) {
    return this.handleProxy('auth', req, body, headers);
  }

  @All('chat/*')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy para service-ai (chat JARVIS)' })
  async proxyAi(@Req() req: Request, @Body() body: unknown, @Headers() headers: Record<string, string>) {
    return this.handleProxy('ai', req, body, headers, '/api/chat');
  }

  @All('voice/*')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy para service-voice' })
  async proxyVoice(@Req() req: Request, @Body() body: unknown, @Headers() headers: Record<string, string>) {
    return this.handleProxy('voice', req, body, headers, '/api/voice');
  }

  @All('search/*')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy para service-search' })
  async proxySearch(@Req() req: Request, @Body() body: unknown, @Headers() headers: Record<string, string>) {
    return this.handleProxy('search', req, body, headers, '/api/search');
  }

  @All('notifications/*')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy para service-notifications' })
  async proxyNotifications(@Req() req: Request, @Body() body: unknown, @Headers() headers: Record<string, string>) {
    return this.handleProxy('notifications', req, body, headers, '/api/notifications');
  }

  @All('media/*')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy para service-media' })
  async proxyMedia(@Req() req: Request, @Body() body: unknown, @Headers() headers: Record<string, string>) {
    return this.handleProxy('media', req, body, headers, '/api/media');
  }

  private async handleProxy(
    service: ServiceName,
    req: Request,
    body: unknown,
    headers: Record<string, string>,
    pathPrefix = '/api/auth',
  ) {
    const subPath = req.url.replace(/^\/api\/(auth|chat|voice|search|notifications|media)/, '');
    const targetPath = `${pathPrefix}${subPath || ''}`;

    try {
      return await this.proxy.forward(
        service,
        req.method,
        targetPath,
        ['GET', 'HEAD'].includes(req.method) ? undefined : body,
        { authorization: headers.authorization ?? '' },
      );
    } catch (error: unknown) {
      const err = error as { response?: { status: number; data: unknown }; message: string };
      throw new HttpException(
        err.response?.data ?? err.message,
        err.response?.status ?? 502,
      );
    }
  }
}
