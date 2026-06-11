import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload, JWT_ISSUER, JWT_AUDIENCE, JWT_ALGORITHMS } from '@myjarvis/shared';
import { IS_PUBLIC_KEY } from '../constants';

export type AuthenticatedRequest = Request & { user: JwtPayload };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token ausente');
    }

    try {
      const payload = this.jwt.verify<JwtPayload>(auth.slice(7), {
        algorithms: [...JWT_ALGORITHMS],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });
      if (!payload.sub || !payload.roles?.length) {
        throw new UnauthorizedException('Token inválido');
      }
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
