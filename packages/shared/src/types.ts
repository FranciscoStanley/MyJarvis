export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

export interface HealthCheck {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  version: string;
  uptime: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  type: 'web' | 'image' | 'video' | 'music';
  thumbnail?: string;
}

export interface VoiceTranscription {
  text: string;
  confidence: number;
  language: string;
}

export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type: 'info' | 'alert' | 'reminder';
  data?: Record<string, unknown>;
}
