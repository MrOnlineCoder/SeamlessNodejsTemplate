import dotenv from 'dotenv-safe';

export interface AppConfig {
  port: number;
  dbUrl: string;
  swaggerUi: boolean;

  mailer: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    secure: boolean;
  };

  resourcesFolder: string;
}

export function loadAppConfig(): AppConfig {
  dotenv.config();

  return {
    port: +process.env.PORT!,
    dbUrl: process.env.DATABASE_URL!,
    swaggerUi: process.env.SWAGGER_UI === 'true',
    mailer: {
      host: process.env.MAILER_HOST!,
      port: +process.env.MAILER_PORT!,
      user: process.env.MAILER_USER!,
      pass: process.env.MAILER_PASS!,
      from: process.env.MAILER_FROM!,
      secure: process.env.MAILER_SECURE === 'true',
    },
    resourcesFolder: process.env.RESOURCES_FOLDER!,
  };
}
