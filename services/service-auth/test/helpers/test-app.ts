import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createStrictValidationPipe } from '@myjarvis/nest-security';

export async function createTestApp(module: Parameters<typeof Test.createTestingModule>[0]): Promise<INestApplication> {
  const testingModule = await Test.createTestingModule(module).compile();
  const app = testingModule.createNestApplication();
  app.useGlobalPipes(createStrictValidationPipe());
  app.setGlobalPrefix('api');
  await app.init();
  return app;
}

export async function closeTestApp(app: INestApplication) {
  await app.close();
}
