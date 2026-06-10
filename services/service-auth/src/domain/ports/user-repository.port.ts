export interface UserRepositoryPort {
  findByEmail(email: string): Promise<{ id: string; email: string; name: string; passwordHash: string } | null>;
  findById(id: string): Promise<{ id: string; email: string; name: string } | null>;
  create(data: { email: string; passwordHash: string; name: string }): Promise<{ id: string; email: string; name: string }>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
