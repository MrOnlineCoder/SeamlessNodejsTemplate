import { AuthHasher } from '../../src/auth/authHasher';
import { AuthSessionStore } from '../../src/auth/authSessionStore';

export const mockAuthHasher: AuthHasher = {
  comparePassword: async (password: string, hashedPassword: string) => {
    return password === hashedPassword;
  },
  hashPassword: async (password: string) => {
    return password;
  },
};

export const mockAuthSessionStore: AuthSessionStore = {
  create: async (session) => {
    return 'mock-session-id';
  },
  get: async (sessionId) => {
    return null;
  },
  delete: async (sessionId) => {
    return;
  },
  getSessionAgeInSeconds() {
    return 60;
  },
};
