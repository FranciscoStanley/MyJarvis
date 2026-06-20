import { UserRole, AuthSource } from '@myjarvis/shared';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string | null;
  role: UserRole;
  authSource: AuthSource;
  ldapDn?: string | null;
  createdAt?: Date;
  termsAcceptedAt?: Date | null;
  termsVersion?: string | null;
}

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
    authSource?: AuthSource;
    termsAcceptedAt?: Date | null;
    termsVersion?: string | null;
  }): Promise<UserRecord>;
  upsertLdapUser(data: {
    email: string;
    name: string;
    ldapDn: string;
    role: UserRole;
  }): Promise<UserRecord>;
  acceptTerms(id: string, version: string, acceptedAt: Date): Promise<UserRecord>;
  updateRole(id: string, role: UserRole): Promise<UserRecord>;
  listAll(): Promise<UserRecord[]>;
  count(): Promise<number>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
