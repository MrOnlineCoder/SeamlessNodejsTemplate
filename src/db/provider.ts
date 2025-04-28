import { AppConfig } from '../config';
import { drizzle } from 'drizzle-orm/node-postgres';

export class DBProvider {
  private db;

  constructor(private readonly config: AppConfig) {
    this.db = drizzle(config.dbUrl);
  }

  public get() {
    return this.db;
  }
}
