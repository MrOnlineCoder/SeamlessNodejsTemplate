import test from 'ava';
import { AuthService } from '../../src/auth/authService';
import { AuthHasher } from '../../src/auth/authHasher';
import { mockAuthHasher, mockAuthSessionStore } from './authMisc';
import { createMockUserRepo } from '../users/usersMisc';
import { mockConfig, mockLogger, mockMailerProvider } from '../misc';
import { MailerService } from '../../src/mailer/mailer.service';

test('password strength check is correct', (t) => {
  const service = new AuthService(
    mockAuthHasher,
    mockAuthSessionStore,
    createMockUserRepo([]),
    new MailerService(mockMailerProvider, mockLogger, mockConfig),
    mockLogger
  );

  t.false(service.isPasswordStrong('qwerty'));
  t.false(service.isPasswordStrong('1234567'));
  t.true(service.isPasswordStrong('12345678'));
  t.true(service.isPasswordStrong('LOiDOFteoc49YUc98B6zz6MVwWkCLxfR'));
});
