import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { THROTTLE_AUTH_KEY } from '../decorators/auth-throttle.decorator';

interface Bucket {
  count: number;
  resetAt: number;
}

/** Rate limit in-memory por IP — complementa @nestjs/throttler */
@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();
  private readonly limit = 10;
  private readonly windowMs = 60_000;

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAuthRoute = this.reflector.getAllAndOverride<boolean>(THROTTLE_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isAuthRoute) return true;

    const req = context.switchToHttp().getRequest<{ ip?: string; socket?: { remoteAddress?: string } }>();
    const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    const now = Date.now();
    const bucket = this.buckets.get(ip) ?? { count: 0, resetAt: now + this.windowMs };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + this.windowMs;
    }

    bucket.count += 1;
    this.buckets.set(ip, bucket);

    if (bucket.count > this.limit) {
      throw new HttpException(
        'Muitas tentativas. Aguarde antes de tentar novamente.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
