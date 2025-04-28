import dotenv from 'dotenv-safe';

export interface AppConfig {
  port: number;
  dbUrl: string;
  swaggerUi: boolean;
}

export function loadAppConfig(): AppConfig {
  dotenv.config();

  return {
    port: +process.env.PORT!,
    dbUrl: process.env.DATABASE_URL!,
    swaggerUi: process.env.SWAGGER_UI === 'true',
  };
}
