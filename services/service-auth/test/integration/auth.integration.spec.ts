import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard, RolesGuard, AuthRateLimitGuard } from '@myjarvis/nest-auth';
import { JWT_ISSUER, JWT_AUDIENCE } from '@myjarvis/shared';
import { LoginProtectionService } from '../../src/infrastructure/security/login-protection.service';
import { UserRole } from '@myjarvis/shared';
import { AuthController, HealthController } from '../../src/presentation/auth.controller';
import {
  RegisterUserUseCase,
  AuthenticateUserUseCase,
  AuthenticateLdapUseCase,
  GetProfileUseCase,
  ListUsersUseCase,
  AssignRoleUseCase,
  AcceptTermsUseCase,
} from '../../src/application/use-cases/auth.use-cases';
import { USER_REPOSITORY } from '../../src/domain/ports/user-repository.port';
import { LDAP_AUTH } from '../../src/domain/ports/ldap-auth.port';
import { InMemoryUserRepository } from '../helpers/in-memory-user.repository';
import { createTestApp, closeTestApp } from '../helpers/test-app';

const mockLdap = {
  isEnabled: () => false,
  authenticate: async (username: string, _password: string) => ({
    email: `${username}@ldap.local`,
    name: username,
    dn: `uid=${username},dc=test,dc=com`,
    isAdmin: username === 'adminldap',
  }),
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: 'test-secret-with-minimum-32-characters!!',
      signOptions: {
        expiresIn: '1h' as `${number}h`,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        algorithm: 'HS256' as const,
      },
    }),
  ],
  controllers: [AuthController, HealthController],
  providers: [
    RegisterUserUseCase,
    AuthenticateUserUseCase,
    AuthenticateLdapUseCase,
    GetProfileUseCase,
    ListUsersUseCase,
    AssignRoleUseCase,
    AcceptTermsUseCase,
    LoginProtectionService,
    { provide: USER_REPOSITORY, useClass: InMemoryUserRepository },
    { provide: LDAP_AUTH, useValue: mockLdap },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
class AuthTestModule {}

describe('Auth Integration', () => {
  let app: INestApplication;
  const email = `integration-${Date.now()}@test.com`;
  let token: string;
  let adminToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await createTestApp({ imports: [AuthTestModule] });
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('GET /api/health', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.status).toBe(200);
  });

  it('POST /api/auth/register cria usuário com role user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password: 'SenhaSegura123!', name: 'Integration Test', acceptTerms: true });
    expect([200, 201]).toContain(res.status);
    expect(res.body.data.roles).toContain(UserRole.USER);
    userId = res.body.data.id;
  });

  it('POST /api/auth/login retorna JWT com roles', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'SenhaSegura123!' });
    expect([200, 201]).toContain(res.status);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.roles).toContain(UserRole.USER);
    token = res.body.data.accessToken;
  });

  it('GET /api/auth/profile com token válido', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(email);
    expect(res.body.data.roles).toContain(UserRole.USER);
  });

  it('POST /api/auth/login/ldap provisiona usuário', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login/ldap')
      .send({ username: 'ldapuser', password: 'any' });
    expect([200, 201]).toContain(res.status);
    expect(res.body.data.user.authSource).toBe('ldap');
  });

  it('POST /api/auth/login/ldap admin recebe role admin', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login/ldap')
      .send({ username: 'adminldap', password: 'any' });
    expect([200, 201]).toContain(res.status);
    expect(res.body.data.user.roles).toContain(UserRole.ADMIN);
    adminToken = res.body.data.accessToken;
  });

  it('GET /api/auth/users requer admin', async () => {
    const denied = await request(app.getHttpServer())
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${token}`);
    expect(denied.status).toBe(403);

    const ok = await request(app.getHttpServer())
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(ok.status).toBe(200);
    expect(Array.isArray(ok.body.data)).toBe(true);
  });

  it('PATCH /api/auth/users/:id/role — admin promove usuário', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/auth/users/${userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: UserRole.ADMIN });
    expect(res.status).toBe(200);
    expect(res.body.data.roles).toContain(UserRole.ADMIN);
  });
});
