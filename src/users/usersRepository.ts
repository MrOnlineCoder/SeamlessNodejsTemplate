import { eq } from 'drizzle-orm';
import { DBProvider } from '../db/provider';
import { User } from './userEntity';
import { usersTable } from './usersTable';

export interface UsersRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

export class SqlUsersRepository implements UsersRepository {
  constructor(private readonly db: DBProvider) {}

  async findById(id: string): Promise<User | null> {
    const [user] = await this.db
      .get()
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    return user ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .get()
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    return user ?? null;
  }

  async create(user: User): Promise<void> {
    await this.db.get().insert(usersTable).values(user);
  }

  async update(user: User): Promise<void> {
    await this.db
      .get()
      .update(usersTable)
      .set(user)
      .where(eq(usersTable.id, user.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.get().delete(usersTable).where(eq(usersTable.id, id));
  }
}
