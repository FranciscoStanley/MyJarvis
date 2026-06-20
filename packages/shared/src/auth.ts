/** Papéis RBAC do MyJarvis */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export type AuthSource = 'local' | 'ldap';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
  authSource?: AuthSource;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  authSource: AuthSource;
  createdAt?: Date;
  termsAcceptedAt?: Date | null;
  termsVersion?: string | null;
  hasAcceptedTerms?: boolean;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.USER]: 1,
  [UserRole.ADMIN]: 2,
};

export function hasRole(userRoles: UserRole[], required: UserRole): boolean {
  if (userRoles.includes(UserRole.ADMIN)) return true;
  return userRoles.includes(required);
}

export function hasAnyRole(userRoles: UserRole[], required: UserRole[]): boolean {
  return required.some((r) => hasRole(userRoles, r));
}

/** Constantes JWT — previne algorithm confusion e tokens de emissor desconhecido */
export const JWT_ISSUER = 'myjarvis-auth';
export const JWT_AUDIENCE = 'myjarvis-api';
export const JWT_ALGORITHMS = ['HS256'] as const;

/** Política mínima de senha (OWASP-inspired) */
export const PASSWORD_POLICY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_\-+.])[A-Za-z\d@$!%*?&#_\-+.]{8,128}$/;

export const PASSWORD_POLICY_MESSAGE =
  'Senha deve ter 8–128 caracteres, maiúscula, minúscula, número e símbolo (@$!%*?&#_-+.)';

export function jwtSignOptions(expiresIn: string) {
  return {
    expiresIn,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithm: 'HS256' as const,
  };
}
