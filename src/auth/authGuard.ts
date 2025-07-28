import { FastifyRequest } from 'fastify';
import { UsersRepository } from '../users/usersRepository';
import { AuthSessionStore } from './authSessionStore';
import { AUTH_SESSION_COOKIE_NAME } from './authService';
import { AppError, ErrorCode } from '../errors';

export class AuthGuard {
  constructor(
    private readonly authSessionStore: AuthSessionStore,
    private readonly userRepository: UsersRepository
  ) {}

  public checkAccess() {
    return async (req: FastifyRequest) => {
      const sessionId = req.cookies[AUTH_SESSION_COOKIE_NAME];

      if (!sessionId) {
        throw new AppError(
          ErrorCode.NOT_ENOUGH_PERMISSIONS,
          'Session ID is missing'
        );
      }

      const session = await this.authSessionStore.get(sessionId);

      if (!session) {
        throw new AppError(
          ErrorCode.NOT_ENOUGH_PERMISSIONS,
          'Invalid auth session'
        );
      }

      const user = await this.userRepository.findById(session.userId);

      if (!user) {
        throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'User not found');
      }

      req.user = user;
      req.sessionId = sessionId;
    };
  }
}
