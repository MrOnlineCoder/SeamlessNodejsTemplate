---
name: edit-backend
description: Contains context and guidelines for editing the backend codebase, including creating new entities, services, routes, dependency injection, and testing.
---

# Codebase Context

This file describes the architectural principles, conventions, and patterns of this codebase. Follow them strictly when adding or modifying code.

---

## Stack

- **Runtime**: Node.js 24+ or other recent LTS version
- **Language**: TypeScript (strict, no `any`)
- **Web framework**: Fastify
- **Database**: PostgreSQL via Drizzle-ORM
- **Test runner**: Ava
- **Config**: `dotenv-safe`
- **Password hashing**: `bcrypt`
- **Email**: `nodemailer` + `eta` templates + `inline-css`
- **Date utilities**: `dayjs`

### Prohibited alternatives

- **No Express, NestJS, Hono** as web framework
- **No TypeORM, Sequelize, Prisma** as ORM
- **No Jest, Mocha, Chai** as test tools
- **No Passport** for authentication
- **No JWT** for sessions
- **No lodash** (use native JS or a small util)
- **No moment** (use `dayjs`)
- **No decorator-based validation** (use `zod` if validation library is needed)
- **No MongoDB or MySQL** as database

---

## Folder Structure

Feature-based layout — each feature owns all its related files:

```
src/
  auth/           # Authentication feature: guard, hasher, routes, service, session store
  db/             # Database connection provider and schema aggregation
  mailer/         # Mail provider interface + implementation, mail service
  users/          # User entity, repository interface + SQL implementation, table schema
  utils/          # Pure, context-free utility functions only
  config.ts       # Config loading via dotenv-safe
  deps.ts         # Dependency wiring — single application container
  errors.ts       # AppError class + ErrorCode enum
  httpProvider.ts # HTTP client provider
  logger.ts       # Logger interface + ConsoleLogger implementation
  server.ts       # Fastify server setup
  index.ts        # Entry point
test/             # Mirrors src/ structure; only *.test.ts files run as tests
```

**Do not** use a Rails-style layout (`controllers/`, `models/`, `views/`, etc.).  
**Do not** pollute `utils/` with anything that is feature-specific or has business context.

---

## Dependency Injection

All dependencies are **manually** injected via constructors. There is no IoC library.

`src/deps.ts` is the single wiring point — it instantiates every class and returns them in one object (`ApplicationContainer`). This object is your whole application.

```typescript
// src/deps.ts
export function createApplicationContainer() {
  const config = loadAppConfig();
  const logger = new ConsoleLogger();
  const dbProvider = new DBProvider(config);
  // ...
  const authService = new AuthService(authHasher, authSessionStore, usersRepository, mailerService, logger);
  return { config, logger, dbProvider, authService, ... };
}
export type ApplicationContainer = ReturnType<typeof createApplicationContainer>;
```

Rules:

- A dependency **must be an interface** when it touches infrastructure (DB, email, HTTP, etc.).
- Services consume interfaces, not concrete classes, allowing easy testing and replacement.
- When adding a new feature, add its wiring to `createApplicationContainer`.

---

## Naming Conventions

| Layer                           | Convention             | Example                          |
| ------------------------------- | ---------------------- | -------------------------------- |
| Persistence (DB access via ORM) | `*Repository`          | `UsersRepository`                |
| Custom DB queries               | `*Gateway`             | `UsersGateway`                   |
| External API / infrastructure   | `*Provider`            | `MailerProvider`, `HttpProvider` |
| Business logic                  | `*Service`             | `AuthService`                    |
| HTTP routes                     | `make*Routes` function | `makeAuthRoutes`                 |

---

## Entities

Entities are **plain TypeScript interfaces** — no classes, no decorators, no ORM types.

```typescript
// src/users/userEntity.ts
export interface User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
}
```

- **Never** use `$inferSelect` from Drizzle or any ORM type as your entity type.
- Entities must be free of any database or infrastructure concern.
- Keep DB schema (`usersTable`) separate from the entity interface.

---

## Database (Drizzle-ORM)

Table schemas live alongside their feature, separate from entities:

```typescript
// src/users/usersTable.ts
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 128 }).notNull().unique(),
  password: varchar('password', { length: 128 }).notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});
```

Rules:

- **Always use UUID primary keys** — generated with `makeEntityId()` from `src/utils/id.ts` in the application layer, never auto-incremented by the DB.
- Use database constraints (`NOT NULL`, `UNIQUE`, foreign keys) as a last line of defense, but always enforce the same rules in application code first.
- **No stored procedures, triggers, or DB functions** for business logic.

---

## Entity IDs

Always generate IDs in the application layer:

```typescript
import { makeEntityId } from '../utils/id';

const user: User = {
  id: makeEntityId(), // crypto.randomUUID()
  email,
  password: hashedPassword,
  createdAt: new Date(),
};
```

Never rely on database sequences or auto-increment for primary keys.

---

## Error Handling

Use `AppError` with a fixed `ErrorCode` enum. Never create custom error subclasses.

```typescript
// Throw immediately when a rule is violated
if (!user) {
  throw new AppError(
    ErrorCode.INVALID_CREDENTIALS,
    'Invalid email or password',
  );
}
if (order.creatorId !== user.id) {
  throw new AppError(
    ErrorCode.NOT_ENOUGH_PERMISSIONS,
    'Only order creator can cancel the order!',
  );
}
```

Available error codes can be read from `src/errors.ts`.

The Fastify error handler in `server.ts` catches all `AppError` instances and returns:

```json
{ "code": "NOT_FOUND", "message": "...", "timestamp": 1746125890728 }
```

---

## Configuration

Config is loaded once in `loadAppConfig()` via `dotenv-safe`, which validates all required env vars against `.env.example`. The resulting `AppConfig` object is passed through DI.

**Do not** read `process.env` anywhere outside of `src/config.ts`.

---

## Authentication

- Sessions only — no JWT.
- `AuthSessionStore` interface abstracts session storage (default: in-memory `InMemoryAuthSessionStore`). It can be replaced with Redis or DB without changing any consumer.
- `AuthHasher` interface abstracts password hashing (default: bcrypt via `BcryptHasher`).
- Session cookie name: `auth_session` (httpOnly, path `/`).
- Auth guard (`AuthGuard`) is used as a Fastify `preHandler`.

---

## HTTP Routes

- Routes are functions returning a `FastifyPluginCallback`, registered via the `ApplicationContainer`.
- Route handlers **only** prepare params, call a service method, and shape the response. No business logic in routes.
- HTTP-level Fastify plugins (cors, helmet, cookie, rate-limit, swagger) live in `server.ts` only.
- **Never** add authentication, DB access, or application-specific middleware to Fastify plugins.

---

## TypeScript

- `any` is **forbidden** in ESLint config. Use `unknown` for truly unknown input, and `Record<K, V>` for object shapes.
- Use `@ts-ignore` only as a last resort with a justification comment.
- All interfaces, types, and generics must be explicit.

---

## Testing

- Test runner: Ava. Test files: `*.test.ts` in `test/` mirroring the `src/` structure.
- Mocks are plain objects implementing interfaces — no mocking library needed:

```typescript
// test/auth/authMisc.ts
export const mockAuthHasher: AuthHasher = {
  comparePassword: async (password, hashedPassword) =>
    password === hashedPassword,
  hashPassword: async (password) => password,
};
```

- Inject mocks via constructor when instantiating the class under test:

```typescript
const service = new AuthService(
  mockAuthHasher,
  mockAuthSessionStore,
  createMockUserRepo([]),
  mockMailerService,
  mockLogger,
);
```

- Test name style: state the behaviour directly, **no "should"** wording.
  - ✅ `'password strength check is correct'`
  - ❌ `'should check password strength correctly'`
- Aim for unit test coverage of **critical business logic** only. Prefer E2E tests (Playwright) for broader coverage.

---

## Adding a New Feature — Checklist

1. Create a folder under `src/<feature>/`.
2. Define the entity as a plain `interface` in `<feature>Entity.ts`.
3. Define the Drizzle table schema in `<feature>Table.ts`.
4. Define the repository/provider **interface** in `<feature>Repository.ts` (or `<feature>Provider.ts`).
5. Implement the interface (e.g. `Sql<Feature>Repository`) in the same file.
6. Write business logic in `<feature>Service.ts`, depending only on interfaces.
7. Write HTTP routes in `<feature>Routes.ts` using `make<Feature>Routes(app)` pattern.
8. Wire everything in `src/deps.ts` inside `createApplicationContainer`.
9. Register routes in `src/server.ts`.
10. Add migrations via Drizzle CLI if the DB schema changed.
11. Add unit tests for critical service logic in `test/<feature>/<feature>Service.test.ts`.

---

## What NOT to Do (Summary)

| Topic           | Forbidden                                    |
| --------------- | -------------------------------------------- |
| Web framework   | Express, NestJS, Hono                        |
| ORM             | TypeORM, Sequelize, Prisma                   |
| Auth            | JWT, Passport, Firebase Auth                 |
| DB primary keys | Auto-increment / DB sequences                |
| DB logic        | Stored procedures, triggers, functions       |
| Error handling  | Custom error subclasses per case             |
| Types           | `any`, untyped `object`                      |
| Config          | Reading `process.env` outside `config.ts`    |
| Fastify plugins | Auth, DB, Redis, JWT in middleware           |
| `utils/`        | Feature-specific or business-context helpers |
| Tests           | Jest, Mocha, Chai; "should" wording          |
| Packages        | lodash, moment, class-validator, passport    |
