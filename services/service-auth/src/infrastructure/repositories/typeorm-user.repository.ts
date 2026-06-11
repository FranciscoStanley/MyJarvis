import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@myjarvis/shared';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRecord, UserRepositoryPort } from '../../domain/ports/user-repository.port';

function toRecord(user: UserEntity): UserRecord {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    passwordHash: user.passwordHash,
    role: user.role as UserRole,
    authSource: user.authSource,
    ldapDn: user.ldapDn,
    createdAt: user.createdAt,
  };
}

@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string) {
    const user = await this.repo.findOne({ where: { email: email.toLowerCase() } });
    return user ? toRecord(user) : null;
  }

  async findById(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    return user ? toRecord(user) : null;
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
    authSource?: UserRecord['authSource'];
  }) {
    const user = this.repo.create({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      name: data.name,
      role: data.role ?? UserRole.USER,
      authSource: data.authSource ?? 'local',
    });
    const saved = await this.repo.save(user);
    return toRecord(saved);
  }

  async upsertLdapUser(data: {
    email: string;
    name: string;
    ldapDn: string;
    role: UserRole;
  }) {
    const email = data.email.toLowerCase();
    let user = await this.repo.findOne({ where: { email } });
    if (user) {
      user.name = data.name;
      user.ldapDn = data.ldapDn;
      user.role = data.role;
      user.authSource = 'ldap';
      user.passwordHash = null;
    } else {
      user = this.repo.create({
        email,
        name: data.name,
        ldapDn: data.ldapDn,
        role: data.role,
        authSource: 'ldap',
        passwordHash: null,
      });
    }
    return toRecord(await this.repo.save(user));
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.repo.findOneOrFail({ where: { id } });
    user.role = role;
    return toRecord(await this.repo.save(user));
  }

  async listAll() {
    const users = await this.repo.find({ order: { createdAt: 'DESC' } });
    return users.map(toRecord);
  }

  async count() {
    return this.repo.count();
  }
}
