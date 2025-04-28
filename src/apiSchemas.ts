import { FastifyInstance } from 'fastify/types/instance';
import { ErrorCode } from './errors';

export function registerApiSchemas(fst: FastifyInstance) {
  fst.addSchema({
    $id: 'User',
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string', format: 'email' },
      name: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  });

  fst.addSchema({
    $id: 'ErrorResponse',
    type: 'object',
    properties: {
      code: { type: 'string', enum: Object.values(ErrorCode) },
      message: { type: 'string' },
      timestamp: { type: 'number' },
    },
  });
}
