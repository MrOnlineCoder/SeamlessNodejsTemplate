import crypto from 'node:crypto';

export function makeEntityId() {
  //TEMPLATE: you may use other IDs like shortid or ULID
  return crypto.randomUUID();
}
