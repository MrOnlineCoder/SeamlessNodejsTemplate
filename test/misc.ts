import { Logger } from '../src/logger';

export const mockLogger: Logger = {
  error(tag: string, message: string, meta?: any) {},
  info(tag: string, message: string, meta?: any) {},
};
