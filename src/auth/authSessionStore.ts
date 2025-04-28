import crypto from 'node:crypto';

export interface AuthSessionPayload {
  userId: string;
  userAgent: string;
  ipAddress: string;
  loginDate: Date;
}

export interface AuthSessionStore {
  create(payload: AuthSessionPayload): Promise<string>;
  get(sessionId: string): Promise<AuthSessionPayload | null>;
  delete(sessionId: string): Promise<void>;
  getSessionAgeInSeconds(): number;
}

export class InMemoryAuthSessionStore implements AuthSessionStore {
  private sessions: Map<string, AuthSessionPayload> = new Map();

  public async create(payload: AuthSessionPayload): Promise<string> {
    const sessionId = this.generateSessionId();
    this.sessions.set(sessionId, payload);
    return sessionId;
  }

  public async get(sessionId: string): Promise<AuthSessionPayload | null> {
    return this.sessions.get(sessionId) || null;
  }

  public async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  private generateSessionId(): string {
    return crypto.randomUUID();
  }

  public getSessionAgeInSeconds() {
    // TEMPLATE: adjust the session age as needed
    return 7 * 24 * 60 * 60; // 7 days in seconds
  }
}
