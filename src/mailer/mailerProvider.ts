import nodemailer from 'nodemailer';
import { AppConfig } from '../config';
import { Logger } from '../logger';
import { makeEntityId } from '../utils/id';

export interface MailerSendParams {
  to: string;
  subject: string;
  html: boolean;
  content: string;
}

export interface MailerProvider {
  sendMail(params: MailerSendParams): Promise<string | null>;
}

export class NodeMailerProvider implements MailerProvider {
  private transport: nodemailer.Transporter;

  constructor(
    private readonly config: AppConfig,
    private readonly logger: Logger
  ) {
    this.transport = nodemailer.createTransport({
      host: config.mailer.host,
      port: config.mailer.port,
      secure: config.mailer.secure,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: config.mailer.user,
        pass: config.mailer.pass,
      },
    });
  }

  async sendMail(params: MailerSendParams): Promise<string | null> {
    try {
      const result = await this.transport.sendMail({
        to: params.to,
        from: this.config.mailer.from,
        subject: params.subject,
        html: params.html ? params.content : undefined,
        text: params.html ? undefined : params.content,
      });

      const messageId = result.messageId ?? makeEntityId();

      this.logger.info(
        'NodeMailerProvider',
        `Successfully sent email to ${params.to} with id = ${messageId}`
      );

      return messageId;
    } catch (error) {
      this.logger.error(
        'NodeMailerProvider',
        `Failed to send email to ${params.to}`,
        error
      );
      return null;
    }
  }
}
