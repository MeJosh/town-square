export * from './types';
import { randomUUID } from 'crypto';

// Utility functions that both projects might need
export const generateId = (): string => {
  return randomUUID();
};

export const getCurrentTimestamp = (): Date => {
  return new Date();
};

export const isValidSessionType = (
  type: string
): type is import('./types').SessionType => {
  return type === 'SCRIPT';
};
