import { Inject } from '@nestjs/common';
import { UserRepository } from '@domain/user/user.repository';
import { InvalidCredentialsError } from '@domain/user/errors/invalid-credentials.error';
import { PasswordHasher } from './password-hasher';
import { User } from '@domain/user/user.entity';
import { USER_REPOSITORY } from '@domain/user/user.tokens';
import { PASSWORD_HASHER } from './auth.tokens';

export type AuthenticateUserInput = {
  username: string;
  password: string;
};

export class AuthenticateUserUsecase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: AuthenticateUserInput): Promise<User> {
    const user = await this.userRepository.findByUsername(input.username);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    user.ensureCanLogin();

    return user;
  }
}
