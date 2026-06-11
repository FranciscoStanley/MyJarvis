import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { json, urlencoded } from 'express';

export const JWT_ISSUER = 'myjarvis-auth';
export const JWT_AUDIENCE = 'myjarvis-api';
export const JWT_ALGORITHMS = ['HS256'] as const;

export interface SecurityBootstrapOptions {
  /** Limite do body JSON (ex: '512kb') */
  bodyLimit?: string;
  /** Desabilita Swagger/docs em produção */
  disableDocsInProduction?: boolean;
}

export function createStrictValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: false },
    stopAtFirstError: true,
  });
}

export function applySecurityMiddleware(
  app: INestApplication,
  options: SecurityBootstrapOptions = {},
): void {
  const isProd = process.env.NODE_ENV === 'production';
  const bodyLimit = options.bodyLimit ?? '512kb';

  app.use(
    helmet({
      contentSecurityPolicy: isProd ? undefined : false,
      crossOriginEmbedderPolicy: false,
      hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    }),
  );

  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));

  app.useGlobalPipes(createStrictValidationPipe());

  app.enableShutdownHooks();
}

export function assertJwtSecretSafe(config: ConfigService): void {
  const secret = config.get<string>('JWT_SECRET', '');
  const isProd = config.get('NODE_ENV') === 'production';

  if (!secret || secret.length < 32) {
    const msg = 'JWT_SECRET deve ter no mínimo 32 caracteres aleatórios';
    if (isProd) throw new Error(msg);
    console.warn(`⚠️  [security] ${msg}`);
  }

  const weak = ['dev-secret', 'change-me', 'secret', 'password', 'myjarvis'];
  if (weak.some((w) => secret.toLowerCase().includes(w))) {
    const msg = 'JWT_SECRET fraco detectado — use valor criptograficamente aleatório';
    if (isProd) throw new Error(msg);
    console.warn(`⚠️  [security] ${msg}`);
  }
}

/** Bloqueia path traversal e caracteres de controle em rotas proxy */
export function sanitizeProxyPath(path: string): string {
  if (!path.startsWith('/') || path.includes('..') || /[\0\r\n\\]/.test(path)) {
    throw new BadRequestException('Caminho inválido');
  }
  if (path.length > 2048) {
    throw new BadRequestException('Caminho excede tamanho máximo');
  }
  return path;
}

/** Headers que não devem ser repassados ao backend (hop-by-hop / spoofing) */
export const BLOCKED_FORWARD_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'upgrade',
  'x-forwarded-host',
  'x-user-id',
  'x-user-email',
  'x-user-roles',
]);

export function pickSafeForwardHeaders(
  headers: Record<string, string | string[] | undefined>,
  allowed: string[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of allowed) {
    const lower = key.toLowerCase();
    if (BLOCKED_FORWARD_HEADERS.has(lower)) continue;
    const val = headers[lower] ?? headers[key];
    if (val === undefined) continue;
    out[key] = Array.isArray(val) ? val[0] : val;
  }
  return out;
}

export function shouldExposeSwagger(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true';
}
