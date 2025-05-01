# Seamless Node.js Template

A very opinionated, "bullet-proof", scalable and maintainable Node.js template for building small and medium-sized applications, that I have come up with after years of experience in different projects.

It follows the principles of SOLID, DDD / Clean Architecture, 12 Factor Apps in a balanced way, while does not overcomplicate things and uses the minimum set of required dependencies.

Out of the box, it provides:

* TypeScript setup
* Ready to use folder structure
* Fastify server with simple REST API setup
* Swagger-UI documentation on OpenAPI 3.0
* Drizzle-ORM for PostgreSQL with migrations setup
* Test environment with Ava runner
* Simple authentication with in-memory sessions
* Safe config loading from .env files
* Ready to use simple mail sending with HTML templates

Aside from just being a template with `package.json` and some code, it also comes with a set of principles and philosophy.

## Getting Started

Prerequisites:

* Node.js
* PostgreSQL

Creating own application from this template:

* Clone the repository
* Remove this README.md, and rename README-app.md to README.md, edit your application name
* Look for `// TEMPLATE:` comments in the code and modify such parts as needed, or remove them
* Follow README instructions to start the application.

## Philosophy and Principles

The listed principles are basically compilation from different paradigms like DDD, Clean Architecture, 12 Factor Apps, etc.
Following them has shown great results in my projects, and I would  recommend to follow them as well.

### 1. Follow strict separation of concerns and direction of dependencies

As by DDD/Clean Architecture, the application code is implicitly divided into multiple layers:

* Anemic domain model (entities are represented by interfaces without logic inside them)
* Business-logic services
* Infrastructure services (database, email, etc.)

**No domain entity or service** may depend directly on any infrastructure part - instead they should depend on interfaces, that are implemented by the infrastructure level. This includes database access, logging, external API calls (directly or through an SDK), network communication, HTTP, etc.
Examples in code:

* Users repository at [src/users/usersRepository.ts](src/users/usersRepository.ts)
* Email provider at [src/mailer/mailerProvider.ts](src/mailer/mailerProvider.ts)

The abstraction (interface) name is up to you, but for sake of consistency, the following naming convention is recommended:

* Persistence layer: `*Repository` (e.g. `UsersRepository`)
* Database custom queries: `*Gateway` (e.g. `UsersGateway`)
* External API provider: `*Provider` (e.g. `EmailProvider`, `TwilioProvider`, etc.)

### 2. Use feature-based folder structure

The code is organized in a feature-based way, where each feature has it's own folder with all the code related to it, including:

* Routes
* Entities
* Table schemas
* Services
* Repositories
* Providers

**Do not** use Ruby on Rails-style folder structure, where you have separate folders for controllers, models, views, etc. This becomes harder and harder to maintain as the application grows. As some wise man said: "Your application should scream when you open it's codebase: I am an order management system!", not "I am a HTTP app with controllers, models and views".

Such approach also allows to easily split the code later if needed, and also allows easier feature-removal.

### 3. Do not use middlewares for everything not related to HTTP, even if the framework or ecosystem allows it

The template comes with some fastify plugins (middlewares) for HTTP-related things, like cookies, CORS, rate-limit, etc. You may add others like `multipart/form-data` parsing, but **do not** add anything related to authentication, database access, things like Redis, JWT, config loading etc.! This must be part of your application logic and easily testable and replaceable!
Fastify is first of all, a web routing framework, it should not care about your auth, database, etc.!

### 4. Do not use JWT unless you have a very good reason to do so

JWT is usually "go-to-way" for authentication in Node.js applications partially due to it being a "buzzword", but in reality, it's very hard to "cook" JWTs in right and secure way. You won't need a pair of access and refresh tokens in most applications.
You are absolutely fine with sessions, that can be stored in memory, Redis or database. You will be able to control all open sessions from server-side perspective, and your frontend won't have to deal with token expiration, refresh tokens, etc.,
as cookies are automatically handled by the browser.

If need to provide an API to non-web clients, like mobile apps, you can still return the `sessionId` in the response and use it as a `Bearer` token. Mobile app does not care if you provide an token as JWT, a session or something else, it's just something they need to send with every request.

#### Do NOT use Firebase or similar solution for authentication

It's a trap! You will vendor lock yourself and will soon or later have to migrate away!
Authentication and access check are critical parts of your application business logic, and shall be managed by you, not some third-party. You write them once in a few hours, and have complete confidence and control over them since then.

### 5. Use environment variables for configuration

Basically comes from the 12 Factor [Config](https://12factor.net/config) principle.

In this template, the configuration is loaded from `.env` files using `dotenv-safe` package, which checks against `.env.example` file. This ensures no environment variable will be missed in production, and ensures that orchestrating software may inject config easily with tools like Docker, Kubernetes, etc.

### 6. Do not pollute utils folder

Utils folder shall contain project-global utility functions that can be applied in **any context**, basically treat them as *pure functions*. If something applies to specific feature or business context, it shall be placed in the feature folder.

### 7. Do not create many Error class types

Template comes with a single `AppError` class that contains systematic code and message for the error.
It should be thrown by the application code, and caught by the error handler middleware.

Do not use Java or C# approach of inventing a new error class for every possible error.

Suggested approach allows easily checking if error comes from the application code or not with a single `instanceof` expression, and also allows to easily add new error codes and messages in the future, along with 1 defined error handler.

## Selection of Dependencies

Node.js ecosystem develops and grows very rapidly, one things replace another, and unfortunately, for many problems there are still no "perfect" or at least "very good" solutions, that is applicable for other languages and platforms like Java, C#, etc.

Nevertheless, through years, I have personally found some libraries to be excellent for their purpose, and consider them the current de-facto standard for Node.js applications.
On the other hand, there are some choices that I strongly oppose against as they are outdated, enforce bad practices or just add unnecessary bloat to your codebase, and here I will try to explain my reasoning.

### Web framework

#### ✅ [Fastify](http://fastify.dev/)

Fastify has recommended itself to be a very good base framework, providing 3 main things:

* Extendable routing system
* Performance
* Typescript support

It has great ecosystem, active development, and is pretty stable.

#### ❌ [Express](https://expressjs.com/)

Express, although being one of the "founding fathers" of Node.js, should never be used for new projects, because:

* It's just too old, it does not support async/await out of box or good error handling
* It's made of spaghetti code
* It has no "real" typescript support
* It has bad performance (regexp routing)
* It just leads to bad practices
* It's not well maintained anymore
* It's usage propagates bad practices, like using middleware for everything or request object pollution

#### ❌ [NestJS](https://nestjs.com/)

Nest.js is kinda of a big deal in the community, but to be honest, I don't see any real profit from it, as Nest.js by itself is **just a fancy Inversion of Control / Dependency Injection** container in it's core with additional features built on top of it in it's ecosystem. Not only implementing DI can be done
easily without vendor-locking yourself into Nest.js ecosystem, but also it uses quite a lof of magic and unnecessary abstractions, like decorators.

Nest.js does not enforce any architecture (it may look like it, but it does not) and has other problems that are not worth dealing with.

#### ❌ [Hono](https://hono.dev/)

Hono is great, but it's too new and I see it's focused on bit other use cases, like edge computing and serverless. I am not ready to use it in production so far.

### Database and ORM/query builder

#### ✅ [PostgreSQL](https://www.postgresql.org/)

Nothing to add, PostgreSQL is the beast. Open source, fast, well maintained, good documentation.

Unless you have very specific requirements, PostgreSQL should be the way to go.

With it's JSONB support, you can easily store embedded data and use it as a document database, if needed.

Therefore, other options are not considered:

* ❌ MongoDB - idea of storing raw JSONs may look appealing, but in reality, well-structured relation database will be better.
* ❌ MySQL - not as good as PostgreSQL, and not as well maintained.

#### ✅ [Drizzle-ORM](https://orm.drizzle.team/)

This is the only ORM that worth using, period.

Aside from being created by my fellow 🇺🇦 countryman, it has:

* Great documentation
* Amazing TypeScript support
* Great toolkit for migrations
* Good performance, as generated queries are very simple
* Active community and development

You can read more on Drizzle philosophy [here](https://orm.drizzle.team/docs/overview), and I can guarantee you that after trying it, you will never want to use anything else.

Other options, in that comparison, are not worth using:

* ❌ TypeORM - just look at number of issues on Github
* ❌ Sequelize - basically as ancient, as Express
* ❌ Prisma - too complicated

### Test runner

#### ✅ [Ava](https://github.com/avajs/ava)

Modern, quick, without any bloat, with Typescript support and great documentation.

* 💡 Possible great replacement: [Vitest](https://vitest.dev/)

#### ❌ Jest, Mocha, Chai

These tools are outdated and bring some or other bloat to your codebase. A test runner nowadays shall provide it's own assertion library, and not rely on external libraries like Chai.

### Reasoning behind other dependencies

* `@fastify/<x>` - official HTTP-level plugins for Fastify (cookie, cors, helmet, rate-limit, swagger)
* `bcrypt` - secure password hashing
* `dotenv-safe` - load .env files and check against .env.example
* `eta` - lightweight HTML templating engine for compiling templates
* `nodemailer` - sending emails
* `inline-css` - inlining CSS styles in HTML templates
* `dayjs` - date formatting and manipulation

## FAQ and "Recipes"

### Your opinion on X is wrong, you suck!

~~Cry about it~~ Well, it's kinda the point of this repo :D. All choices and principles are built on my personal experience, for my personal usage when applicable. You are free to attempt to convince me otherwise in repo issues.

### How dependency injection works in this template?

All dependencies are *manually* injected into the constructors of the classes. Dependency shall be an interface, when possible. Services may skip the interface implementation if they are not injected anywhere else.

There is a [deps.ts](src/deps.ts) file that instantiates all dependencies and exports them in a single object.
This object is basically **your whole application**. You can use that in any environment, be it an HTTP request handler, a command line interface, a cron job, etc.

The manual initialization can seem a bit tedious, but that is small price to pay for:

* Freedom from any IoC library
* Ability to visualize relationships between dependencies, discover circular dependencies, even just with TypeScript compiler
* Easy testing

### How do I write a unit test?

The `test/` folder mimics the overall structure of `src` folder, but with test files.

A test file should be named `*.test.ts` and placed in the same folder as the file it tests.

> Do not apply **should** wording in the test names, just state what the test does. Express requirement, not wish or desire.

Mocking can easily be done without any external tool, as your dependencies are passed in the constructor and are interfaces.

You can just create empty dumb objects or some stub implementations, like this:

```typescript
export const mockAuthHasher: AuthHasher = {
  comparePassword: async (password: string, hashedPassword: string) => {
    return password === hashedPassword;
  },
  hashPassword: async (password: string) => {
    return password;
  },
};


const authService = new AuthService(mockAuthHasher, ...);
```

### What should be covered by unit tests?

Although this template provides a foundation for testing, you should not aim for 100% unit coverage, this is usually waste of time.

Use unit tests to cover really **critical** parts of your business logic.

Otherwise, prefer writing E2E tests, they provide more value for less effort. Recommended tool for E2E tests is [Playwright](https://playwright.dev/), as it's modern and has great API.

### Can I use Drizzle-ORM $inferSelect for defining entity types, instead of manually describing them

Yes, but I would not recommend it. Manually describing entities with interfaces and creating a matching database separately schema allows:

* Your entities to be "crystal-clear" of any database-related stuff. They are just objects with data, nothing more.
* Easily separate your entities definition into a package for shader usage by other projects, including frontend
* Allows possibly extending later to rich domain model.

## Can I use Passport for authentication?

**NO!** Passport is a huge bloat and another piece of spaghetti code. Handle your authentication yourself, it's not that hard.
Writing OAuth integrations with Google, Facebook, etc is also easy. This will save you a lot of time and headache in the future.

## How would I approach writing an API integration with external system?

1. Create a provider interface, abstracting away any external system communication details:

```typescript
export interface SomePaymentSystemProvider {
    createPayment(amount: number, currency: string): Promise<SomeSystemPayment>;
    processPayment(paymentId: string): Promise<SomeSystemPayment>;
    getPaymentStatus(paymentId: string): Promise<SomeSystemPayment>;
}
```

2. Create a "default" implementation of the provider, that actually takes care of the communication with the external system:

```typescript
class DefaultSomePaymentSystemProvider implements SomePaymentSystemProvider {
    async createPayment(amount: number, currency: string): Promise<SomeSystemPayment> {
        // Call external system API with fetch or whatever, handle all authentication, etc.
    }

    async processPayment(paymentId: string): Promise<SomeSystemPayment> {
        // Call external system API with fetch or whatever, handle all authentication, etc.
    }

    async getPaymentStatus(paymentId: string): Promise<SomeSystemPayment> {
        // Call external system API with fetch or whatever, handle all authentication, etc.
    }
}

```

3. Provide the implementation to all services or other classes that depend on `SomePaymentSystemProvider` interface in [src/deps.ts](src/deps.ts) file.


## Why there are no controllers in this template?

I consider that there is no need for controllers and routes separation, as controllers shall just propagate request params from HTTP to application layer with a few lines of code. Therefore, they are joined into "routes" in this template.

If your route code does something more than preparing params, calling a service and preparing the response, then you should consider refactoring your code.

## License

MIT
