import { UserRole } from '@myjarvis/shared';

export interface LdapUserProfile {
  email: string;
  name: string;
  dn: string;
  isAdmin: boolean;
}

export interface LdapAuthPort {
  authenticate(username: string, password: string): Promise<LdapUserProfile>;
  isEnabled(): boolean;
}

export const LDAP_AUTH = Symbol('LDAP_AUTH');
