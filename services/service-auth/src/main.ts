import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import {

  applySecurityMiddleware,

  assertJwtSecretSafe,

  shouldExposeSwagger,

} from '@myjarvis/nest-security';

import { AppModule } from './app.module';



async function bootstrap() {

  const app = await NestFactory.create(AppModule, { rawBody: false });

  const config = app.get(ConfigService);



  assertJwtSecretSafe(config);

  applySecurityMiddleware(app, { bodyLimit: '256kb' });



  const corsOrigin = config.get<string>('CORS_ORIGIN', '');

  if (corsOrigin) {

    app.enableCors({ origin: corsOrigin.split(',').map((o) => o.trim()), credentials: false });

  }



  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.setGlobalPrefix('api');



  if (shouldExposeSwagger()) {

    const swagger = new DocumentBuilder()

      .setTitle('MyJarvis Auth Service')

      .setDescription('Autenticação e autorização de usuários')

      .setVersion('1.0')
      .setContact('Francisco Stanley Rodrigues Albuquerque', '', '')
      .addBearerAuth()

      .build();

    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swagger));

  }



  await app.listen(config.get('PORT', 3001));

  console.log(`🔐 Auth service on port ${config.get('PORT', 3001)}`);

}

bootstrap();

