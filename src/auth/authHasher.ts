import bcrypt from 'bcrypt';

export interface AuthHasher {
  hashPassword(raw: string): Promise<string>;
  comparePassword(raw: string, hashed: string): Promise<boolean>;
}

export class BcryptHasher implements AuthHasher {
  private readonly saltRounds: number;

  constructor(saltRounds: number) {
    this.saltRounds = saltRounds;
  }

  public async hashPassword(raw: string): Promise<string> {
    return await bcrypt.hash(raw, this.saltRounds);
  }

  public async comparePassword(raw: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(raw, hashed);
  }
}
