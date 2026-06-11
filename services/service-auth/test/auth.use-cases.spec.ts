import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUserUseCase, AuthenticateUserUseCase } from '../src/application/use-cases/auth.use-cases';
import { ConflictException } from '@nestjs/common';

describe('Auth Use Cases', () => {
  const mockRepo = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    upsertLdapUser: vi.fn(),
    updateRole: vi.fn(),
    listAll: vi.fn(),
    count: vi.fn(),
  };

  describe('RegisterUserUseCase', () => {
    let useCase: RegisterUserUseCase;
    beforeEach(() => {
      vi.clearAllMocks();
      useCase = new RegisterUserUseCase(mockRepo);
    });

    it('should reject duplicate email', async () => {
      mockRepo.findByEmail.mockResolvedValue({ id: '1' });
      await expect(
        useCase.execute({ email: 'a@b.com', password: '12345678', name: 'Test' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('AuthenticateUserUseCase', () => {
    it('should reject invalid credentials', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      const useCase = new AuthenticateUserUseCase(mockRepo, { sign: vi.fn() } as never);
      await expect(
        useCase.execute({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toThrow();
    });
  });
});
