import { PasswordHasher } from '@application/auth/password-hasher';

export class FakePasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return password;
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return plain === hash;
  }
}
