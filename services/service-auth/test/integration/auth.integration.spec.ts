import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController, HealthController } from '../../src/presentation/auth.controller';
import {
  RegisterUserUseCase,
  AuthenticateUserUseCase,
  GetProfileUseCase,
} from '../../src/application/use-cases/auth.use-cases';
import { USER_REPOSITORY } from '../../src/domain/ports/user-repository.port';
import { InMemoryUserRepository } from '../helpers/in-memory-user.repository';
import { createTestApp, closeTestApp } from '../helpers/test-app';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '1h' } }),
  ],
  controllers: [AuthController, HealthController],
  providers: [
    RegisterUserUseCase,
    AuthenticateUserUseCase,
    GetProfileUseCase,
    { provide: USER_REPOSITORY, useClass: InMemoryUserRepository },
  ],
})
class AuthTestModule {}

describe('Auth Integration', () => {
  let app: INestApplication;
  const email = `integration-${Date.now()}@test.com`;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp({ imports: [AuthTestModule] });
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('GET /api/health', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('service-auth');
  });

  it('POST /api/auth/register cria usuário', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password: 'SenhaSegura123!', name: 'Integration Test' });
    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(email);
  });

  it('POST /api/auth/login retorna JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'SenhaSegura123!' });
    expect([200, 201]).toContain(res.status);
    expect(res.body.data.accessToken).toBeDefined();
    token = res.body.data.accessToken;
  });

  it('GET /api/auth/profile com token válido', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(email);
  });

  it('GET /api/auth/profile sem token retorna 401', async () => {
    const res = await request(app.getHttpServer()).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/register rejeita email duplicado', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password: 'SenhaSegura123!', name: 'Dup' });
    expect(res.status).toBe(409);
  });
});
