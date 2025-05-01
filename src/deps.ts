import { AuthGuard } from './auth/authGuard';
import { BcryptHasher } from './auth/authHasher';
import { AuthService } from './auth/authService';
import { InMemoryAuthSessionStore } from './auth/authSessionStore';
import { loadAppConfig } from './config';
import { DBProvider } from './db/provider';
import { ConsoleLogger } from './logger';
import { NodeMailerProvider } from './mailer/mailer.provider';
import { MailerService } from './mailer/mailer.service';
import { SqlUsersRepository } from './users/usersRepository';

export function createApplicationContainer() {
  const config = loadAppConfig();
  const logger = new ConsoleLogger();

  const dbProvider = new DBProvider(config);
  const mailerProvider = new NodeMailerProvider(config, logger);

  const usersRepository = new SqlUsersRepository(dbProvider);

  const authHasher = new BcryptHasher(12);
  const authSessionStore = new InMemoryAuthSessionStore();

  const mailerService = new MailerService(mailerProvider, logger, config);

  const authService = new AuthService(
    authHasher,
    authSessionStore,
    usersRepository,
    mailerService,
    logger
  );
  const authGuard = new AuthGuard(authSessionStore, usersRepository);

  return {
    config,
    logger,
    dbProvider,
    usersRepository,
    authHasher,
    authSessionStore,
    authService,
    authGuard,
  };
}

export type ApplicationContainer = ReturnType<
  typeof createApplicationContainer
>;
