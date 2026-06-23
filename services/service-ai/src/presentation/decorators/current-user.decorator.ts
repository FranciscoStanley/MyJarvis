import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

export interface GatewayUser {
  id: string;
  email: string;
  roles: string[];
}

export function extractGatewayUser(req: Request): GatewayUser {
  const id = req.headers['x-user-id'];
  if (typeof id !== 'string' || !id.trim()) {
    throw new UnauthorizedException('Usuário não identificado');
  }

  const email = typeof req.headers['x-user-email'] === 'string' ? req.headers['x-user-email'] : '';
  const rolesHeader = typeof req.headers['x-user-roles'] === 'string' ? req.headers['x-user-roles'] : '';
  const roles = rolesHeader ? rolesHeader.split(',').filter(Boolean) : [];

  return { id, email, roles };
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): GatewayUser => {
  const req = ctx.switchToHttp().getRequest<Request>();
  return extractGatewayUser(req);
});
