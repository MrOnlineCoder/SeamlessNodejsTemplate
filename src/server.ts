import { ApplicationContainer } from './deps';

import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifySwagger from '@fastify/swagger';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwaggerUi from '@fastify/swagger-ui';

import { User } from './users/userEntity';
import { registerApiSchemas } from './apiSchemas';
import { AUTH_SESSION_COOKIE_NAME } from './auth/authService';
import { makeAuthRoutes } from './auth/authRoutes';
import { AppError, ErrorCode } from './errors';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User | null;
    sessionId?: string;
  }
}

export async function startWebServer(app: ApplicationContainer) {
  const server = fastify({
    trustProxy: true,
  });

  server.decorateRequest('user', null);
  server.decorateRequest('sessionId', '');

  await server.register(fastifyHelmet);
  await server.register(fastifyCors, {
    origin: '*',
  });
  await server.register(fastifyRateLimit, {
    errorResponseBuilder: () => {
      throw new AppError(
        ErrorCode.TOO_MANY_REQUESTS,
        `Too many requests, please try again later`
      );
    },
  });
  await server.register(fastifyCookie);
  await server.register(fastifySwagger, {
    //TEMPLATE: adjust the swagger options as needed
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'My Application API',
        version: '1.0.0',
      },
      tags: [
        {
          name: 'auth',
          description: 'Authentication related endpoints',
        },
      ],
      servers: [
        {
          url: `http://localhost:${app.config.port}`,
          description: 'Local development server',
        },
      ],
      components: {
        securitySchemes: {
          session: {
            type: 'apiKey',
            in: 'cookie',
            name: AUTH_SESSION_COOKIE_NAME,
          },
        },
      },
    },
  });

  if (app.config.swaggerUi) {
    await server.register(fastifySwaggerUi, {
      routePrefix: '/api-docs',
    });
  }

  registerApiSchemas(server);

  server.setNotFoundHandler((request) => {
    throw new AppError(
      ErrorCode.NOT_FOUND,
      `Requested URL (${request.method} ${request.url}) not found`
    );
  });

  server.setSchemaErrorFormatter((errors) => {
    const error = errors[0];

    const fieldName = error.instancePath.substring(1);

    return new AppError(
      ErrorCode.VALIDATION_ERROR,
      error.message
        ? `Field '${fieldName}' is invalid: ${error.message}`
        : `Field '${fieldName}' is invalid`
    );
  });

  server.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.toHttpCode()).send({
        code: error.code,
        message: error.message,
        timestamp: Date.now(),
      });
    } else {
      app.logger.error(
        'Server',
        `Unknown error at ${request.method} ${request.url}:`,
        error
      );

      reply.status(500).send({
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        timestamp: Date.now(),
      });
    }
  });

  server.get(
    '/',
    {
      schema: {
        description: 'Health check endpoint',
        response: {
          200: {
            type: 'object',
            properties: {
              alive: { type: 'boolean' },
            },
          },
        },
      },
    },
    () => ({ alive: true })
  );

  await server.register(makeAuthRoutes(app), {
    prefix: '/api/auth',
  });

  const startedOn = await server.listen({
    host: '0.0.0.0',
    port: app.config.port,
  });

  app.logger.info('Server', `Listening started on ${startedOn}`);

  if (app.config.swaggerUi) {
    app.logger.info(
      'Server',
      `Swagger UI available at http://localhost:${app.config.port}/api-docs`
    );
  }
}
