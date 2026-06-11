import { Injectable, UnauthorizedException } from '@nestjs/common';

interface FailureRecord {
  count: number;
  lockedUntil?: number;
}

/** Proteção contra brute-force por identificador + IP */
@Injectable()
export class LoginProtectionService {
  private readonly failures = new Map<string, FailureRecord>();
  private readonly maxAttempts = 5;
  private readonly lockMs = 15 * 60 * 1000;

  private key(identifier: string, ip?: string): string {
    return `${identifier.toLowerCase()}:${ip ?? 'unknown'}`;
  }

  assertNotLocked(identifier: string, ip?: string): void {
    const record = this.failures.get(this.key(identifier, ip));
    if (record?.lockedUntil && Date.now() < record.lockedUntil) {
      throw new UnauthorizedException(
        'Muitas tentativas falhas. Conta bloqueada temporariamente.',
      );
    }
  }

  recordFailure(identifier: string, ip?: string): void {
    const k = this.key(identifier, ip);
    const record = this.failures.get(k) ?? { count: 0 };
    record.count += 1;
    if (record.count >= this.maxAttempts) {
      record.lockedUntil = Date.now() + this.lockMs;
      record.count = 0;
    }
    this.failures.set(k, record);
  }

  recordSuccess(identifier: string, ip?: string): void {
    this.failures.delete(this.key(identifier, ip));
  }
}
