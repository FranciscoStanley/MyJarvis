import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUserUseCase, AcceptTermsUseCase } from '../src/application/use-cases/auth.use-cases';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { TERMS_VERSION } from '@myjarvis/shared';

describe('Auth Use Cases', () => {
  const mockRepo = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    upsertLdapUser: vi.fn(),
    acceptTerms: vi.fn(),
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
        useCase.execute({ email: 'a@b.com', password: '12345678', name: 'Test', acceptTerms: true }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject registration without terms acceptance', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      await expect(
        useCase.execute({ email: 'a@b.com', password: '12345678', name: 'Test', acceptTerms: false }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should store terms acceptance on register', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
        name: 'Test',
        role: 'user',
        authSource: 'local',
        termsAcceptedAt: new Date(),
        termsVersion: TERMS_VERSION,
      });
      const user = await useCase.execute({
        email: 'a@b.com',
        password: 'Secure1!',
        name: 'Test',
        acceptTerms: true,
      });
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ termsVersion: TERMS_VERSION, termsAcceptedAt: expect.any(Date) }),
      );
      expect(user.hasAcceptedTerms).toBe(true);
    });
  });

  describe('AcceptTermsUseCase', () => {
    it('should reject when acceptTerms is false', async () => {
      const useCase = new AcceptTermsUseCase(mockRepo);
      await expect(useCase.execute('user-1', false)).rejects.toThrow(BadRequestException);
    });
  });
});
