import { omitKeysInObject } from '../utils/object';

export interface User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
}

export function toPublicUser(user: User): Omit<User, 'password'> {
  return omitKeysInObject(user, ['password']);
}
