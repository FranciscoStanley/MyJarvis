import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { APP_GUARD } from '@nestjs/core';

import { HttpModule } from '@nestjs/axios';

import { JwtModule } from '@nestjs/jwt';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { JwtAuthGuard, RolesGuard } from '@myjarvis/nest-auth';

import { JWT_ISSUER, JWT_AUDIENCE } from '@myjarvis/shared';

import { HealthController } from './presentation/health.controller';

import { ProxyController } from './presentation/proxy.controller';

import { ProxyService } from './application/proxy.service';



@Module({

  imports: [

    ConfigModule.forRoot({ isGlobal: true }),

    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),

    HttpModule.register({ timeout: 30_000, maxRedirects: 0 }),

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

  controllers: [HealthController, ProxyController],

  providers: [

    ProxyService,

    { provide: APP_GUARD, useClass: ThrottlerGuard },

    { provide: APP_GUARD, useClass: JwtAuthGuard },

    { provide: APP_GUARD, useClass: RolesGuard },

  ],

})

export class AppModule {}

