export interface Session {
  id: string;
  name: string;
  startTime: Date;
  lastUpdated: Date;
  type: string;
  state: Record<string, unknown>;
}

export interface CreateSessionDto {
  name: string;
  type: string;
  state?: Record<string, unknown>;
}

export interface UpdateSessionDto {
  name?: string;
  state?: Record<string, unknown>;
}

// Blood on the Clocktower Script Types
export interface BloodOnTheClockTowerCharacter {
  id: string;
  name: string;
  edition: string;
  team: 'townsfolk' | 'outsider' | 'minion' | 'demon';
  firstNight?: number;
  firstNightReminder?: string;
  otherNight?: number;
  otherNightReminder?: string;
  reminders?: string[];
  setup?: boolean;
  ability: string;
  image?: string;
}

export interface ScriptMetadata {
  id: string;
  name: string;
  author: string;
  type: string;
  logo?: string;
}

export interface ScriptState {
  meta: ScriptMetadata;
  characters: BloodOnTheClockTowerCharacter[];
}

export type SessionState = ScriptState | Record<string, unknown>;
