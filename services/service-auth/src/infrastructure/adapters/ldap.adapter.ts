import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'ldapts';
import { UserRole } from '@myjarvis/shared';
import { LdapAuthPort, LdapUserProfile } from '../../domain/ports/ldap-auth.port';

@Injectable()
export class LdapAdapter implements LdapAuthPort {
  private readonly logger = new Logger(LdapAdapter.name);

  constructor(private readonly config: ConfigService) {}

  isEnabled(): boolean {
    return this.config.get('LDAP_ENABLED', 'false') === 'true';
  }

  async authenticate(username: string, password: string): Promise<LdapUserProfile> {
    if (!this.isEnabled()) {
      throw new UnauthorizedException('LDAP desabilitado');
    }

    const url = this.config.getOrThrow<string>('LDAP_URL');
    const bindDn = this.config.get<string>('LDAP_BIND_DN');
    const bindPassword = this.config.get<string>('LDAP_BIND_PASSWORD');
    const baseDn = this.config.getOrThrow<string>('LDAP_BASE_DN');
    const userFilterTemplate =
      this.config.get('LDAP_USER_FILTER', '(|(mail={{username}})(uid={{username}}))') ?? '';
    const adminGroupDn = this.config.get<string>('LDAP_ADMIN_GROUP_DN');

    const client = new Client({ url, timeout: 10000, connectTimeout: 10000 });

    try {
      if (bindDn && bindPassword) {
        await client.bind(bindDn, bindPassword);
      }

      const filter = userFilterTemplate.replace(/\{\{username\}\}/g, escapeFilter(username));
      const { searchEntries } = await client.search(baseDn, {
        scope: 'sub',
        filter,
        attributes: ['dn', 'mail', 'uid', 'cn', 'displayName', 'memberOf'],
      });

      if (!searchEntries.length) {
        throw new UnauthorizedException('Usuário LDAP não encontrado');
      }

      const entry = searchEntries[0];
      const userDn = entry.dn;
      const email =
        String(entry.mail ?? entry.userPrincipalName ?? `${username}@ldap.local`).toLowerCase();
      const name = String(entry.displayName ?? entry.cn ?? username);

      await client.bind(userDn, password);

      let isAdmin = false;
      if (adminGroupDn) {
        const groups = normalizeMemberOf(entry.memberOf);
        isAdmin = groups.some((g) => g.toLowerCase() === adminGroupDn.toLowerCase());
      }

      return {
        email,
        name,
        dn: userDn,
        isAdmin,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.warn(`Falha LDAP: ${error instanceof Error ? error.message : error}`);
      throw new UnauthorizedException('Credenciais LDAP inválidas');
    } finally {
      await client.unbind().catch(() => undefined);
    }
  }
}

function escapeFilter(value: string): string {
  return value.replace(/[*\\()\\0]/g, (c) => {
    const map: Record<string, string> = { '*': '\\2a', '\\': '\\5c', '(': '\\28', ')': '\\29', '\0': '\\00' };
    return map[c] ?? c;
  });
}

function normalizeMemberOf(memberOf: unknown): string[] {
  if (!memberOf) return [];
  if (Array.isArray(memberOf)) return memberOf.map(String);
  return [String(memberOf)];
}

export function ldapRoleFromProfile(isAdmin: boolean): UserRole {
  return isAdmin ? UserRole.ADMIN : UserRole.USER;
}
