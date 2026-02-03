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

  const gracefulShutdown = () => {
    //disconnect from DB, redis if needed

    app.logger.info('Index', 'Shutdown signal received');
    process.exit(0);
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

  await startWebServer(app);
}

run();
