import { FastifyPluginCallback } from 'fastify';
import { ApplicationContainer } from '../deps';
import { AUTH_SESSION_COOKIE_NAME } from './authService';
import { toPublicUser } from '../users/userEntity';

export function makeAuthRoutes(
  app: ApplicationContainer
): FastifyPluginCallback {
  return (fst, options, done) => {
    fst.post<{
      Body: {
        email: string;
        password: string;
      };
    }>(
      '/login',
      {
        schema: {
          description:
            'Login with email and password. A cookie with session ID on success will be set',
          tags: ['auth'],
          body: {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string' },
            },
          },
          response: {
            200: {
              type: 'object',
              properties: {
                sessionId: { type: 'string' },
              },
            },
          },
        },
        config: {
          rateLimit: {
            max: 5,
            timeWindow: '1 minute',
          },
        },
      },
      async (req, reply) => {
        const sessionId = await app.authService.login({
          email: req.body.email,
          ipAddress: req.ip,
          password: req.body.password,
          userAgent: req.headers['user-agent'] || 'n/a',
        });

        reply.setCookie(AUTH_SESSION_COOKIE_NAME, sessionId, {
          httpOnly: true,
          path: '/',
          maxAge: app.authSessionStore.getSessionAgeInSeconds(),
        });

        return {
          sessionId,
        };
      }
    );

    fst.get(
      '/me',
      {
        preHandler: app.authGuard.checkAccess(),
        schema: {
          description: 'Get current user',
          tags: ['auth'],
          security: [
            {
              session: [],
            },
          ],
          response: {
            200: {
              $ref: 'User#',
            },
          },
        },
      },
      async (req, reply) => {
        return toPublicUser(req.user!);
      }
    );

    fst.post(
      '/logout',
      {
        preHandler: app.authGuard.checkAccess(),
        schema: {
          description: 'Logout current user',
          tags: ['auth'],
          security: [
            {
              session: [],
            },
          ],
          response: {
            200: {
              type: 'object',
              properties: {
                ok: { type: 'boolean' },
              },
            },
          },
        },
      },
      async (req, reply) => {
        await app.authService.logout(req.sessionId!);
        reply.clearCookie(AUTH_SESSION_COOKIE_NAME, {
          path: '/',
          httpOnly: true,
        });

        return {
          ok: true,
        };
      }
    );

    fst.post<{
      Body: {
        email: string;
        password: string;
      };
    }>(
      '/signup',
      {
        schema: {
          description: 'Signup to create a new user.',
          tags: ['auth'],
          body: {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string' },
            },
          },
          response: {
            200: {
              type: 'object',
              properties: {
                ok: { type: 'boolean' },
              },
            },
          },
        },
        config: {
          rateLimit: {
            max: 5,
            timeWindow: '1 minute',
          },
        },
      },
      async (req, reply) => {
        await app.authService.signup(req.body);

        return {
          ok: true,
        };
      }
    );

    done();
  };
}
