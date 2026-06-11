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

  applySecurityMiddleware(app, { bodyLimit: '1mb' });



  app.enableCors({

    origin: config.get('CORS_ORIGIN', 'http://localhost:3100').split(',').map((o: string) => o.trim()),

    credentials: true,

    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    allowedHeaders: ['Content-Type', 'Authorization'],

    maxAge: 86400,

  });



  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.setGlobalPrefix('api');



  if (shouldExposeSwagger()) {

    const swagger = new DocumentBuilder()

      .setTitle('MyJarvis API Gateway')

      .setDescription('Ponto de entrada unificado para todos os microserviços MyJarvis')

      .setVersion('1.0')
      .setContact('Francisco Stanley Rodrigues Albuquerque', '', '')
      .addBearerAuth()

      .build();

    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swagger));

  }



  const port = config.get('PORT', 3000);

  await app.listen(port);

  console.log(`🚀 Gateway running on http://localhost:${port}`);

  if (shouldExposeSwagger()) {

    console.log(`📚 Swagger: http://localhost:${port}/api/docs`);

  }

}

bootstrap();

