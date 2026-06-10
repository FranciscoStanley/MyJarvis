import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../domain/entities/user.entity';
import { UserRepositoryPort } from '../domain/ports/user-repository.port';

@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string) {
    const user = await this.repo.findOne({ where: { email } });
    return user ?? null;
  }

  async findById(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name };
  }

  async create(data: { email: string; passwordHash: string; name: string }) {
    const user = this.repo.create(data);
    const saved = await this.repo.save(user);
    return { id: saved.id, email: saved.email, name: saved.name };
  }
}
