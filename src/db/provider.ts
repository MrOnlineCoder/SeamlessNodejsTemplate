import { AppConfig } from '../config';
import { drizzle } from 'drizzle-orm/node-postgres';

import { Pool } from 'pg';

export class DBProvider {
  private db;
  private pool: Pool;

  constructor(private readonly config: AppConfig) {
    this.pool = new Pool({
      connectionString: config.dbUrl,
    });
    this.db = drizzle(this.pool);
  }

  public get() {
    return this.db;
  }
}
