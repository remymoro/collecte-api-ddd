import { PasswordHasher } from '@application/auth/password-hasher';

export class FakePasswordHasher implements PasswordHasher {
  async compare(plain: string, hash: string): Promise<boolean> {
    return plain === hash;
  }
}
