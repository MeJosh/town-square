// Session Types
export interface Session {
  id: string; // UUID
  name: string;
  startTime: Date;
  lastUpdated: Date;
  type: SessionType;
  state: SessionState;
}

export type SessionType = 'SCRIPT';

// Session State - varies by type
export type SessionState = ScriptSessionState;

// Script Session State (based on librarian JSON structure)
export interface ScriptSessionState {
  meta: ScriptMeta;
  characters: string[]; // Array of character role strings
}

export interface ScriptMeta {
  id: '_meta';
  name: string;
  author: string;
}

// Character Display Types (for web app)
export interface Character {
  id: string;
  name: string;
  description: string;
  section: CharacterSection;
}

export type CharacterSection = 'townsfolk' | 'outsiders' | 'minions' | 'demons';

// API Request/Response Types
export interface CreateSessionRequest {
  name: string;
  type: SessionType;
  state?: Partial<SessionState>;
}

export interface UpdateSessionRequest {
  name?: string;
  state?: Partial<SessionState>;
}

export interface SessionResponse {
  session: Session;
}

export interface SessionListResponse {
  sessions: Session[];
}

// Error Types
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Utility Types
export type SessionId = string;
export type CharacterId = string;
