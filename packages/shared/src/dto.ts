export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

import { UserRole, AuthSource } from './auth';
import type { ClientAction } from './actions';
import type { SearchResult } from './types';

export interface AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: UserRole[];
    authSource?: AuthSource;
  };
}

export interface LdapLoginDto {
  username: string;
  password: string;
}

export interface AssignRoleDto {
  role: UserRole;
}

export interface SendMessageDto {
  message: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}

export interface ChatResponseDto {
  reply: string;
  sessionId: string;
  actions?: JarvisAction[];
  searchResults?: SearchResult[];
  clientActions?: ClientAction[];
}

export interface JarvisAction {
  type: 'search' | 'image' | 'video' | 'music' | 'open_url' | 'open_app' | 'notification' | 'speak';
  query?: string;
  data?: Record<string, unknown>;
}

export interface SearchQueryDto {
  query: string;
  type?: 'web' | 'image' | 'video' | 'music';
  limit?: number;
}

export interface TranscribeDto {
  audioBase64: string;
  language?: string;
}

export interface SynthesizeDto {
  text: string;
  voice?: string;
  speed?: number;
}
