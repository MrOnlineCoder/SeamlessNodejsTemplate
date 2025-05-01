import { AppConfig, loadAppConfig } from '../src/config';
import { Logger } from '../src/logger';
import { MailerProvider } from '../src/mailer/mailer.provider';

export const mockLogger: Logger = {
  error(tag: string, message: string, meta?: any) {},
  info(tag: string, message: string, meta?: any) {},
};

export const mockMailerProvider: MailerProvider = {
  sendMail: async (params) => {
    return 'mocked-message-id';
  },
};

export const mockConfig: AppConfig = {
  port: 3000,
  dbUrl: 'postgres://localhost:5432/mydb',
  swaggerUi: true,
  mailer: {
    from: 'ava@test.com',
    host: 'localhost',
    pass: 'password',
    port: 587,
    secure: false,
    user: 'user',
  },
  resourcesFolder: 'resources',
};
