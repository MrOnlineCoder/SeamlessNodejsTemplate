import { Eta } from 'eta';
import { AppConfig } from '../config';
import { MailerProvider, MailerSendParams } from './mailerProvider';

import path from 'node:path';
import inlineCss from 'inline-css';
import { Logger } from '../logger';

//TEMPLATE: add your templates here, each must correspond to a file in the resources folder
export enum MailerTemplateType {
  WELCOME = 'welcome',
}

export interface SendTemplateMailOptions {
  to: string;
  type: MailerTemplateType;
  subject: string;
  payload: Record<string, any>;
}

export interface MailerService {
  sendMail(params: SendTemplateMailOptions): Promise<string | null>;
}

export class EtaTemplatedMailerService implements MailerService {
  private renderer: Eta;

  constructor(
    private readonly mailerProvider: MailerProvider,
    private readonly logger: Logger,
    private readonly config: AppConfig
  ) {
    this.renderer = new Eta({
      cache: true,
      views: path.join(process.cwd(), this.config.resourcesFolder, 'mails'),
    });
  }

  async sendMail(params: SendTemplateMailOptions) {
    let template: string | null = null;

    try {
      template = await this.renderer.renderAsync(
        `${params.type}.html`,
        params.payload
      );
    } catch (error) {
      this.logger.error(
        'MailerService',
        `Failed to render template "${params.type}"`,
        error
      );
      return null;
    }

    const inlineTemplate = await inlineCss(template, {
      url: '/',
    });

    const mailOptions: MailerSendParams = {
      to: params.to,
      subject: params.subject,
      html: true,
      content: inlineTemplate,
    };

    return await this.mailerProvider.sendMail(mailOptions);
  }
}
