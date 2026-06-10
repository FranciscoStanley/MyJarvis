import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '../../src/domain/ports/user-repository.port';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

@Injectable()
export class InMemoryUserRepository implements UserRepositoryPort {
  private users: StoredUser[] = [];

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async findById(id: string) {
    const u = this.users.find((x) => x.id === id);
    return u ? { id: u.id, email: u.email, name: u.name } : null;
  }

  async create(data: { email: string; passwordHash: string; name: string }) {
    const user = { id: crypto.randomUUID(), ...data };
    this.users.push(user);
    return { id: user.id, email: user.email, name: user.name };
  }
}
