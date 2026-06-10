import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

export async function createTestApp(module: Parameters<typeof Test.createTestingModule>[0]): Promise<INestApplication> {
  const testingModule: TestingModule = await Test.createTestingModule(module).compile();
  const app = testingModule.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  await app.init();
  return app;
}

export async function closeTestApp(app: INestApplication) {
  await app.close();
}
