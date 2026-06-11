import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { APP_GUARD } from '@nestjs/core';

import { JwtModule } from '@nestjs/jwt';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard, RolesGuard, AuthRateLimitGuard } from '@myjarvis/nest-auth';

import { JWT_ISSUER, JWT_AUDIENCE } from '@myjarvis/shared';

import { UserEntity } from './domain/entities/user.entity';

import { USER_REPOSITORY } from './domain/ports/user-repository.port';

import { LDAP_AUTH } from './domain/ports/ldap-auth.port';

import { TypeOrmUserRepository } from './infrastructure/repositories/typeorm-user.repository';

import { LdapAdapter } from './infrastructure/adapters/ldap.adapter';

import { DisabledLdapAdapter } from './infrastructure/adapters/disabled-ldap.adapter';

import { LoginProtectionService } from './infrastructure/security/login-protection.service';

import {

  RegisterUserUseCase,

  AuthenticateUserUseCase,

  AuthenticateLdapUseCase,

  GetProfileUseCase,

  ListUsersUseCase,

  AssignRoleUseCase,

  SeedAdminUseCase,

} from './application/use-cases/auth.use-cases';

import { AuthBootstrapService } from './infrastructure/bootstrap/auth-bootstrap.service';

import { AuthController, HealthController } from './presentation/auth.controller';



@Module({

  imports: [

    ConfigModule.forRoot({ isGlobal: true }),

    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),

    TypeOrmModule.forRootAsync({

      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({

        type: 'postgres',

        url: config.get('DATABASE_URL'),

        entities: [UserEntity],

        synchronize: config.get('NODE_ENV') !== 'production',

      }),

    }),

    TypeOrmModule.forFeature([UserEntity]),

    JwtModule.registerAsync({

      global: true,

      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({

        secret: config.get('JWT_SECRET', 'dev-secret'),

        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', '7d') as `${number}d`,
          issuer: JWT_ISSUER,
          audience: JWT_AUDIENCE,
          algorithm: 'HS256' as const,
        },

      }),

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

    SeedAdminUseCase,

    LoginProtectionService,

    AuthBootstrapService,

    LdapAdapter,

    DisabledLdapAdapter,

    {

      provide: LDAP_AUTH,

      inject: [ConfigService, LdapAdapter, DisabledLdapAdapter],

      useFactory: (config: ConfigService, real: LdapAdapter, disabled: DisabledLdapAdapter) =>

        config.get('LDAP_ENABLED', 'false') === 'true' ? real : disabled,

    },

    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },

    { provide: APP_GUARD, useClass: ThrottlerGuard },

    { provide: APP_GUARD, useClass: AuthRateLimitGuard },

    { provide: APP_GUARD, useClass: JwtAuthGuard },

    { provide: APP_GUARD, useClass: RolesGuard },

  ],

})

export class AppModule {}

