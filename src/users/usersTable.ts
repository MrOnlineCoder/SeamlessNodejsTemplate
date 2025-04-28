import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 128 }).notNull().unique(),
  password: varchar('password', { length: 128 }).notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});
