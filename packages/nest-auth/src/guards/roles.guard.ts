import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, hasAnyRole } from '@myjarvis/shared';
import { ROLES_KEY } from '../constants';
import { AuthenticatedRequest } from './jwt-auth.guard';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const roles = req.user?.roles ?? [];
    if (!hasAnyRole(roles, required)) {
      throw new ForbiddenException('Permissão insuficiente');
    }
    return true;
  }
}
