import { Injectable, OnModuleInit } from '@nestjs/common';
import { SeedAdminUseCase } from '../../application/use-cases/auth.use-cases';

@Injectable()
export class AuthBootstrapService implements OnModuleInit {
  constructor(private readonly seedAdmin: SeedAdminUseCase) {}

  async onModuleInit() {
    await this.seedAdmin.executeOnBootstrap();
  }
}
