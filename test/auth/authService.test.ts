import test from 'ava';
import { AuthService } from '../../src/auth/authService';
import { AuthHasher } from '../../src/auth/authHasher';
import { mockAuthHasher, mockAuthSessionStore } from './authMisc';
import { createMockUserRepo } from '../users/usersMisc';
import { mockLogger, mockMailerService } from '../misc';
import { MailerService } from '../../src/mailer/mailerService';

test('password strength check is correct', (t) => {
  const service = new AuthService(
    mockAuthHasher,
    mockAuthSessionStore,
    createMockUserRepo([]),
    mockMailerService,
    mockLogger
  );

  t.false(service.isPasswordStrong('qwerty'));
  t.false(service.isPasswordStrong('1234567'));
  t.true(service.isPasswordStrong('12345678'));
  t.true(service.isPasswordStrong('LOiDOFteoc49YUc98B6zz6MVwWkCLxfR'));
});
