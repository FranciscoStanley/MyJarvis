import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LdapAuthPort } from '../../domain/ports/ldap-auth.port';

@Injectable()
export class DisabledLdapAdapter implements LdapAuthPort {
  constructor(private readonly config: ConfigService) {}

  isEnabled(): boolean {
    return false;
  }

  async authenticate(username: string, password: string) {
    const mockUser = this.config.get('LDAP_MOCK_USER');
    const mockPass = this.config.get('LDAP_MOCK_PASSWORD');
    if (mockUser && mockPass && username === mockUser && password === mockPass) {
      return {
        email: `${mockUser}@ldap.local`,
        name: `LDAP ${mockUser}`,
        dn: `uid=${mockUser},dc=example,dc=com`,
        isAdmin: this.config.get('LDAP_MOCK_ADMIN', 'false') === 'true',
      };
    }
    throw new UnauthorizedException(
      'LDAP desabilitado. Defina LDAP_ENABLED=true ou LDAP_MOCK_USER/PASSWORD para testes.',
    );
  }
}
