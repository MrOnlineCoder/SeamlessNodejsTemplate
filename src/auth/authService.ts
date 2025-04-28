import { AppError, ErrorCode } from '../errors';
import { Logger } from '../logger';
import { User } from '../users/userEntity';
import { UsersRepository } from '../users/usersRepository';
import { makeEntityId } from '../utils/id';
import { AuthHasher } from './authHasher';
import { AuthSessionStore } from './authSessionStore';

export interface AuthLoginParams {
  email: string;
  password: string;
  userAgent: string;
  ipAddress: string;
}

export interface AuthSignupParams {
  email: string;
  password: string;
}

//TEMPLATE: Adjust the cookie name as needed
//It's usually a good idea to prefix your cookie with some application-specific string
export const AUTH_SESSION_COOKIE_NAME = 'auth_session';

export class AuthService {
  constructor(
    private readonly authHasher: AuthHasher,
    private readonly authSessionStore: AuthSessionStore,
    private readonly userRepository: UsersRepository,
    private readonly logger: Logger
  ) {}

  public isPasswordStrong(password: string): boolean {
    // TEMPLATE: Very basic check, extend as needed
    return password.length >= 8 && password.length <= 64;
  }

  async login(params: AuthLoginParams) {
    const user = await this.userRepository.findByEmail(params.email);

    if (!user) {
      throw new AppError(
        ErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password'
      );
    }

    const isPasswordValid = await this.authHasher.comparePassword(
      params.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new AppError(
        ErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password'
      );
    }

    const sessionId = await this.authSessionStore.create({
      userId: user.id,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      loginDate: new Date(),
    });

    this.logger.info(
      'AuthService',
      `User logged in: ${user.email} from ${params.ipAddress}`
    );

    return sessionId;
  }

  async logout(sessionId: string) {
    const session = await this.authSessionStore.get(sessionId);

    if (!session) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS, 'Session not found');
    }

    await this.authSessionStore.delete(sessionId);
  }

  async signup(params: AuthSignupParams) {
    const existingUser = await this.userRepository.findByEmail(params.email);

    if (existingUser) {
      throw new AppError(
        ErrorCode.INVALID_CREDENTIALS,
        'User with this email already exists'
      );
    }

    if (!this.isPasswordStrong(params.password)) {
      throw new AppError(
        ErrorCode.INVALID_CREDENTIALS,
        'Password is not strong enough'
      );
    }

    const newUser: User = {
      id: makeEntityId(),
      email: params.email,
      password: await this.authHasher.hashPassword(params.password),
      createdAt: new Date(),
    };

    await this.userRepository.create(newUser);

    this.logger.info('AuthService', `New user sign up: ${params.email}`);

    return newUser;
  }
}
