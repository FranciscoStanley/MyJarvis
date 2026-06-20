import { UserRole, AuthSource } from '@myjarvis/shared';
import { UserRecord, UserRepositoryPort } from '../../src/domain/ports/user-repository.port';

interface StoredUser extends UserRecord {}

export class InMemoryUserRepository implements UserRepositoryPort {
  users: StoredUser[] = [];

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email.toLowerCase()) ?? null;
  }

  async findById(id: string) {
    return this.users.find((x) => x.id === id) ?? null;
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
    authSource?: AuthSource;
    termsAcceptedAt?: Date | null;
    termsVersion?: string | null;
  }) {
    const user: StoredUser = {
      id: crypto.randomUUID(),
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      name: data.name,
      role: data.role ?? UserRole.USER,
      authSource: data.authSource ?? 'local',
      ldapDn: null,
      termsAcceptedAt: data.termsAcceptedAt ?? null,
      termsVersion: data.termsVersion ?? null,
    };
    this.users.push(user);
    return user;
  }

  async upsertLdapUser(data: {
    email: string;
    name: string;
    ldapDn: string;
    role: UserRole;
  }) {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      existing.name = data.name;
      existing.ldapDn = data.ldapDn;
      existing.role = data.role;
      existing.authSource = 'ldap';
      existing.passwordHash = null;
      return existing;
    }
    const user: StoredUser = {
      id: crypto.randomUUID(),
      email: data.email.toLowerCase(),
      name: data.name,
      ldapDn: data.ldapDn,
      role: data.role,
      authSource: 'ldap',
      passwordHash: null,
    };
    this.users.push(user);
    return user;
  }

  async updateRole(id: string, role: UserRole) {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('not found');
    user.role = role;
    return user;
  }

  async acceptTerms(id: string, version: string, acceptedAt: Date) {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('not found');
    user.termsAcceptedAt = acceptedAt;
    user.termsVersion = version;
    return user;
  }

  async listAll() {
    return [...this.users];
  }

  async count() {
    return this.users.length;
  }
}
