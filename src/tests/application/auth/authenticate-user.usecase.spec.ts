import { AuthenticateUserUsecase } from '@application/auth/authenticate-user.usecase';
import { InvalidCredentialsError } from '@domain/user/errors/invalid-credentials.error';
import { NoActiveCenterError } from '@domain/user/errors/no-active-center.error';
import { User } from '@domain/user/user.entity';
import { FakePasswordHasher } from './fake-password-hasher';
import { InMemoryUserRepository } from './in-memory-user.repository';

describe('AuthenticateUserUsecase', () => {
  const hasher = new FakePasswordHasher();

  it('throws if user does not exist', async () => {
    const repo = new InMemoryUserRepository([]);
    const usecase = new AuthenticateUserUsecase(repo, hasher);

    await expect(
      usecase.execute({ username: 'john', password: '123' })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('throws if password is invalid', async () => {
    const user = new User('1', 'john', 'hash', 'BENEVOLE', 'center-1');
    const repo = new InMemoryUserRepository([user]);
    const usecase = new AuthenticateUserUsecase(repo, hasher);

    await expect(
      usecase.execute({ username: 'john', password: 'wrong' })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('throws if user has no active center', async () => {
    const user = new User('1', 'john', 'hash', 'BENEVOLE', null);
    const repo = new InMemoryUserRepository([user]);
    const usecase = new AuthenticateUserUsecase(repo, hasher);

    await expect(
      usecase.execute({ username: 'john', password: 'hash' })
    ).rejects.toBeInstanceOf(NoActiveCenterError);
  });

  it('returns user if authentication succeeds', async () => {
    const user = new User('1', 'john', 'hash', 'BENEVOLE', 'center-1');
    const repo = new InMemoryUserRepository([user]);
    const usecase = new AuthenticateUserUsecase(repo, hasher);

    const result = await usecase.execute({
      username: 'john',
      password: 'hash',
    });

    expect(result).toBe(user);
  });
});
