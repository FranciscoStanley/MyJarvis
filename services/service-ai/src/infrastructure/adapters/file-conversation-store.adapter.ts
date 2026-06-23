import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ChatMessage } from '@myjarvis/shared';
import {
  buildSessionTitle,
  ConversationSession,
  ConversationSessionSummary,
} from '../../domain/entities/conversation-session.entity';
import { ConversationStorePort } from '../../domain/ports/ai.port';

interface UserConversationsFile {
  version: 1;
  sessions: ConversationSession[];
}

@Injectable()
export class FileConversationStoreAdapter implements ConversationStorePort, OnModuleInit {
  private readonly logger = new Logger(FileConversationStoreAdapter.name);
  private readonly dataDir: string;
  private readonly maxSessionsPerUser: number;
  private readonly maxMessagesPerSession: number;
  private readonly cache = new Map<string, ConversationSession[]>();
  private readonly loadPromises = new Map<string, Promise<void>>();
  private readonly writeQueues = new Map<string, Promise<void>>();

  constructor(config: ConfigService) {
    this.dataDir = config.get('CONVERSATIONS_DATA_DIR', './data/conversations');
    this.maxSessionsPerUser = Number(config.get('CONVERSATIONS_MAX_SESSIONS', 50));
    this.maxMessagesPerSession = Number(config.get('CONVERSATIONS_MAX_MESSAGES', 200));
  }

  async onModuleInit() {
    await fs.mkdir(path.resolve(this.dataDir), { recursive: true });
    this.logger.log(`Conversation store: ${path.resolve(this.dataDir)}`);
  }

  async getMessages(sessionId: string, userId: string): Promise<ChatMessage[]> {
    const session = await this.findSession(sessionId, userId);
    return session?.messages ?? [];
  }

  async addMessage(sessionId: string, userId: string, message: ChatMessage): Promise<void> {
    const session = await this.findSession(sessionId, userId);
    if (!session) return;

    session.messages.push(message);
    if (session.messages.length > this.maxMessagesPerSession) {
      session.messages = session.messages.slice(-this.maxMessagesPerSession);
    }

    if (message.role === 'user' && session.title === 'Nova conversa') {
      session.title = buildSessionTitle(message.content);
    }

    session.updatedAt = new Date().toISOString();
    this.sortSessions(userId);
    await this.persist(userId);
  }

  async createSession(userId: string): Promise<string> {
    const sessions = await this.ensureLoaded(userId);
    const now = new Date().toISOString();
    const session: ConversationSession = {
      id: randomUUID(),
      userId,
      title: 'Nova conversa',
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    sessions.unshift(session);
    if (sessions.length > this.maxSessionsPerUser) {
      sessions.splice(this.maxSessionsPerUser);
    }

    await this.persist(userId);
    return session.id;
  }

  async listSessions(userId: string): Promise<ConversationSessionSummary[]> {
    const sessions = await this.ensureLoaded(userId);
    return sessions.map((session) => ({
      id: session.id,
      userId: session.userId,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: session.messages.length,
      preview: this.lastPreview(session.messages),
    }));
  }

  async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    const sessions = await this.ensureLoaded(userId);
    const index = sessions.findIndex((s) => s.id === sessionId);
    if (index === -1) return false;
    sessions.splice(index, 1);
    await this.persist(userId);
    return true;
  }

  async sessionExists(sessionId: string, userId: string): Promise<boolean> {
    return Boolean(await this.findSession(sessionId, userId));
  }

  private async findSession(sessionId: string, userId: string): Promise<ConversationSession | undefined> {
    const sessions = await this.ensureLoaded(userId);
    return sessions.find((s) => s.id === sessionId);
  }

  private async ensureLoaded(userId: string): Promise<ConversationSession[]> {
    if (!this.cache.has(userId)) {
      if (!this.loadPromises.has(userId)) {
        this.loadPromises.set(userId, this.loadUser(userId));
      }
      await this.loadPromises.get(userId);
    }
    return this.cache.get(userId)!;
  }

  private async loadUser(userId: string) {
    const filePath = this.userFilePath(userId);
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(raw) as UserConversationsFile;
      if (parsed?.version === 1 && Array.isArray(parsed.sessions)) {
        this.cache.set(userId, parsed.sessions);
        return;
      }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(`Falha ao carregar conversas de ${userId}: ${(err as Error).message}`);
      }
    }
    this.cache.set(userId, []);
  }

  private sortSessions(userId: string) {
    const sessions = this.cache.get(userId);
    if (!sessions) return;
    sessions.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }

  private lastPreview(messages: ChatMessage[]): string | undefined {
    const last = [...messages].reverse().find((m) => m.role === 'assistant' || m.role === 'user');
    if (!last) return undefined;
    const text = last.content.replace(/\s+/g, ' ').trim();
    return text.length > 72 ? `${text.slice(0, 72)}…` : text;
  }

  private userFilePath(userId: string): string {
    const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(path.resolve(this.dataDir), `${safeId}.json`);
  }

  private async persist(userId: string) {
    const previous = this.writeQueues.get(userId) ?? Promise.resolve();
    const next = previous.then(async () => {
      const sessions = this.cache.get(userId) ?? [];
      const filePath = this.userFilePath(userId);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      const payload: UserConversationsFile = { version: 1, sessions };
      await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
    });
    this.writeQueues.set(userId, next);
    await next;
  }
}
