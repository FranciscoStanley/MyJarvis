import { SetMetadata } from '@nestjs/common';

export const THROTTLE_AUTH_KEY = 'throttle:auth';

/** Rate limit reforçado para login/register/LDAP */
export const AuthThrottle = () => SetMetadata(THROTTLE_AUTH_KEY, true);
