import { Injectable } from '@nestjs/common';
import { SessionData } from './dto';

@Injectable()
export class SessionManager {
  private readonly sessions = new Map<string, SessionData>();

  constructor() {
    setInterval(() => this.cleanup(), 1000 * 60 * 5).unref();
      console.log("SESSION MANAGER INSTANCE:", this);

  }

  create(sessionId: string, ttlMs = 1000 * 60 * 30): SessionData {

    console.log(`Creating session with ID: ${sessionId}`);

    const now = Date.now();
    const session: SessionData = {
      state: {step: 'DEFAULT'},
      createdAt: now,
      expiresAt: now + ttlMs
    };

    this.sessions.set(sessionId, session);
    return session;
    }

  get(sessionId: string): SessionData | undefined {

    console.log(`Retrieving session with ID: ${sessionId} SessionData: ${JSON.stringify(this.sessions.get(sessionId))} `);

    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    if (session.expiresAt < Date.now()) {
      this.sessions.delete(sessionId);
      return undefined;
    }

    return session;
  }

  update(sessionId: string, patch: Record<string, any>): SessionData {
    let session = this.get(sessionId);
    if (!session) {
      session = this.create(sessionId);
    }

    Object.assign(session.state, patch);
    session.expiresAt = Date.now() + (session.expiresAt - session.createdAt);

    return session;
  }

  delete(sessionId: string) {
    this.sessions.delete(sessionId);
  }

  cleanup() {

    console.log(`Cleaning up expired sessions`);

    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(id);
      }
    }
  }
}
