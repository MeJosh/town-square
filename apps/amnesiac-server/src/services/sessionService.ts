import { v4 as uuidv4 } from 'uuid';
import {
  Session,
  CreateSessionDto,
  UpdateSessionDto,
} from '../types/session.js';

class SessionService {
  private sessions: Map<string, Session> = new Map();

  async createSession(sessionData: CreateSessionDto): Promise<Session> {
    const session: Session = {
      id: uuidv4(),
      name: sessionData.name,
      startTime: new Date(),
      lastUpdated: new Date(),
      type: sessionData.type,
      state: sessionData.state || {},
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async getSession(id: string): Promise<Session | null> {
    return this.sessions.get(id) || null;
  }

  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async updateSession(
    id: string,
    updateData: UpdateSessionDto
  ): Promise<Session | null> {
    const session = this.sessions.get(id);
    if (!session) {
      return null;
    }

    const updatedSession: Session = {
      ...session,
      ...updateData,
      lastUpdated: new Date(),
    };

    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteSession(id: string): Promise<boolean> {
    return this.sessions.delete(id);
  }

  async updateSessionState(
    id: string,
    state: Record<string, unknown>
  ): Promise<Session | null> {
    const session = this.sessions.get(id);
    if (!session) {
      return null;
    }

    const updatedSession: Session = {
      ...session,
      state: { ...session.state, ...state },
      lastUpdated: new Date(),
    };

    this.sessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const sessionService = new SessionService();
