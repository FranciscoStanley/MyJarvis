import { Injectable, Inject, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole, JwtPayload, AuthUser, hasRole } from '@myjarvis/shared';
import { LoginProtectionService } from '../../infrastructure/security/login-protection.service';
import { USER_REPOSITORY, UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { LDAP_AUTH, LdapAuthPort } from '../../domain/ports/ldap-auth.port';
import { ldapRoleFromProfile } from '../../infrastructure/adapters/ldap.adapter';

function toAuthUser(user: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  authSource: AuthUser['authSource'];
  createdAt?: Date;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: [user.role],
    authSource: user.authSource,
    createdAt: user.createdAt,
  };
}

function signToken(jwt: JwtService, user: { id: string; email: string; role: UserRole; authSource: AuthUser['authSource'] }) {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    roles: [user.role],
    authSource: user.authSource,
  };
  return jwt.sign(payload);
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
  ) {}

  async execute(dto: { email: string; password: string; name: string }) {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email já cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.users.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: UserRole.USER,
      authSource: 'local',
    });
    return toAuthUser(user);
  }
}

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
    private readonly jwt: JwtService,
    private readonly loginProtection: LoginProtectionService,
  ) {}

  async execute(dto: { email: string; password: string }, meta?: { ip?: string }) {
    this.loginProtection.assertNotLocked(dto.email, meta?.ip);

    const user = await this.users.findByEmail(dto.email);
    if (!user || user.authSource === 'ldap') {
      this.loginProtection.recordFailure(dto.email, meta?.ip);
      throw new UnauthorizedException('Credenciais inválidas');
    }
    if (!user.passwordHash) {
      this.loginProtection.recordFailure(dto.email, meta?.ip);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      this.loginProtection.recordFailure(dto.email, meta?.ip);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    this.loginProtection.recordSuccess(dto.email, meta?.ip);
    const accessToken = signToken(this.jwt, user);
    return { accessToken, user: toAuthUser(user) };
  }
}

@Injectable()
export class AuthenticateLdapUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
    @Inject(LDAP_AUTH) private readonly ldap: LdapAuthPort,
    private readonly jwt: JwtService,
    private readonly loginProtection: LoginProtectionService,
  ) {}

  async execute(dto: { username: string; password: string }, meta?: { ip?: string }) {
    this.loginProtection.assertNotLocked(dto.username, meta?.ip);

    try {
      const profile = await this.ldap.authenticate(dto.username, dto.password);
      const role = ldapRoleFromProfile(profile.isAdmin);
      const user = await this.users.upsertLdapUser({
        email: profile.email,
        name: profile.name,
        ldapDn: profile.dn,
        role,
      });
      this.loginProtection.recordSuccess(dto.username, meta?.ip);
      const accessToken = signToken(this.jwt, user);
      return { accessToken, user: toAuthUser(user) };
    } catch {
      this.loginProtection.recordFailure(dto.username, meta?.ip);
      throw new UnauthorizedException('Credenciais LDAP inválidas');
    }
  }
}

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
  ) {}

  async execute(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    return toAuthUser(user);
  }
}

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
  ) {}

  execute() {
    return this.users.listAll().then((list) =>
      list.map((u) => toAuthUser(u)),
    );
  }
}

@Injectable()
export class AssignRoleUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
  ) {}

  async execute(actorRoles: UserRole[], userId: string, role: UserRole) {
    if (!hasRole(actorRoles, UserRole.ADMIN)) {
      throw new ForbiddenException('Apenas administradores podem alterar papéis');
    }
    const user = await this.users.updateRole(userId, role);
    return toAuthUser(user);
  }
}

@Injectable()
export class SeedAdminUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
    private readonly config: ConfigService,
  ) {}

  async executeOnBootstrap() {
    const email = this.config.get<string>('ADMIN_SEED_EMAIL');
    const password = this.config.get<string>('ADMIN_SEED_PASSWORD');
    const name = this.config.get('ADMIN_SEED_NAME', 'Administrador');
    if (!email || !password) return;

    const existing = await this.users.findByEmail(email);
    if (existing) {
      if (existing.role !== UserRole.ADMIN) {
        await this.users.updateRole(existing.id, UserRole.ADMIN);
      }
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await this.users.create({
      email,
      passwordHash,
      name,
      role: UserRole.ADMIN,
      authSource: 'local',
    });
  }
}
