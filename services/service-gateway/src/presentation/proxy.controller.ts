import {
  Controller,
  All,
  Req,
  Body,
  Headers,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { JwtAuthGuard, RolesGuard, Public, AuthenticatedRequest } from '@myjarvis/nest-auth';
import { sanitizeProxyPath, pickSafeForwardHeaders } from '@myjarvis/nest-security';
import { ProxyService, ServiceName } from '../application/proxy.service';

@ApiTags('Proxy')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @All('auth/*path')
  @ApiOperation({ summary: 'Proxy para service-auth (rotas públicas de login)' })
  async proxyAuth(@Req() req: Request, @Body() body: unknown, @Headers() headers: Record<string, string>) {
    return this.handleProxy('auth', req, body, headers, undefined);
  }

  @All('chat/*path')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy para service-ai (chat JARVIS)' })
  async proxyAi(@Req() req: AuthenticatedRequest, @Body() body: unknown, @Headers() headers: Record<string, string>) {
    return this.handleProxy('ai', req, body, headers, '/api/chat', req.user);
  }

  @All('voice/*path')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy para service-voice' })
  async proxyVoice(@Req() req: AuthenticatedRequest, @Body() body: unknown, @Headers() headers: Record<string, string>) {
    return this.handleProxy('voice', req, body, headers, '/api/voice', req.user);
  }

  @All('search/*path')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy para service-search' })
  async proxySearch(@Req() req: AuthenticatedRequest, @Body() body: unknown, @Headers() headers: Record<string, string>) {
    return this.handleProxy('search', req, body, headers, '/api/search', req.user);
  }

  @All('notifications/*path')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy para service-notifications' })
  async proxyNotifications(@Req() req: AuthenticatedRequest, @Body() body: unknown, @Headers() headers: Record<string, string>) {
    return this.handleProxy('notifications', req, body, headers, '/api/notifications', req.user);
  }

  @All('media/*path')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy para service-media' })
  async proxyMedia(@Req() req: AuthenticatedRequest, @Body() body: unknown, @Headers() headers: Record<string, string>) {
    return this.handleProxy('media', req, body, headers, '/api/media', req.user);
  }

  private async handleProxy(
    service: ServiceName,
    req: Request,
    body: unknown,
    headers: Record<string, string>,
    pathPrefix = '/api/auth',
    user?: AuthenticatedRequest['user'],
  ) {
    const subPath = req.url.replace(/^\/api\/(auth|chat|voice|search|notifications|media)/, '');
    const targetPath = sanitizeProxyPath(`${pathPrefix}${subPath || ''}`);

    const safe = pickSafeForwardHeaders(headers, ['authorization', 'accept', 'accept-language']);
    const forwardHeaders: Record<string, string> = {};
    if (safe.authorization) forwardHeaders.authorization = safe.authorization;

    if (user) {
      forwardHeaders['x-user-id'] = user.sub;
      forwardHeaders['x-user-email'] = user.email;
      forwardHeaders['x-user-roles'] = user.roles.join(',');
    }

    try {
      return await this.proxy.forward(
        service,
        req.method,
        targetPath,
        ['GET', 'HEAD'].includes(req.method) ? undefined : body,
        forwardHeaders,
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
