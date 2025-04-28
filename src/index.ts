import { createApplicationContainer } from './deps';
import { startWebServer } from './server';

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection at:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

async function run() {
  const app = createApplicationContainer();

  await startWebServer(app);
}

run();
