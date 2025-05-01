import { AppConfig, loadAppConfig } from '../src/config';
import { Logger } from '../src/logger';
import { MailerProvider } from '../src/mailer/mailerProvider';
import { MailerService } from '../src/mailer/mailerService';

export const mockLogger: Logger = {
  error(tag: string, message: string, meta?: any) {},
  info(tag: string, message: string, meta?: any) {},
};

export const mockMailerProvider: MailerProvider = {
  sendMail: async (params) => {
    return 'mocked-message-id';
  },
};

export const mockMailerService: MailerService = {
  sendMail: async (params) => {
    return 'mocked-message-id';
  },
};
