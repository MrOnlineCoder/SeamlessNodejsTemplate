# Server-side agent instructions

## Domain

[enter your domain description here]

## Folders

- All source code is located in `src/` directory
- All tests are located in `test/` directory
- All static resources like templates, public keys, etc are located in `resources/` directory
- All database migrations, seed and SQL scripts are placed into `db/` directory, including `migrations/` and `seeds/` subdirectories

## Scripts

- Use `npm run lint` to check for linting errors (or `npm run lint:fix` to automatically fix them)
- Use `npm run test` to run all tests
- Use `npm run build` to compile the TypeScript code to JavaScript and get a production bundle

## Limitations

- NEVER run any docker commands
- NEVER run any python commands unless told otherwise
- NEVER run any database migrations, scripts or seeders
- NEVER install third-party dependencies without explicit permission from the user

## Context

Use `edit-backend` skill when making modifications in server-side code.