# Your Project Name

## Preparing local environment

1. Clone the repository
2. Install dependencies via `npm install`
3. Build the application with `npm run build`
4. Copy [.env.example](.env.example) to `.env` and fill in the required values
5. Start the application with `npm start`
6. Open your browser and navigate to `http://localhost:3000` (by default) to see the application in action
7. Swagger API spec is available at `http://localhost:3000/swagger.json` (by default)

## Running Tests

```bash
npm test
```

## Creating DB migrations

After changing database schema (adding/removing columns, tables, etc.), run:

```bash
npm run db:generate
```

A new SQL migration file will be created in `db/migrations` directory. You can then apply the migration manually with:

```bash
psql my_db < db/migrations/001_migration_name.sql
```
