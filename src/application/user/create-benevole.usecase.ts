import { Inject } from '@nestjs/common';
import { User } from '@domain/user/user.entity';
import { UserRepository } from '@domain/user/user.repository';
import { USER_REPOSITORY } from '@domain/user/user.tokens';
import { UserAlreadyExistsError } from '@domain/user/errors/user-already-exists.error';
import { PASSWORD_HASHER } from '@application/auth/auth.tokens';
import { PasswordHasher } from '@application/auth/password-hasher';

export type CreateBenevoleInput = {
  username: string;
  password: string;
  centerId: string;
};

export class CreateUserForCenterUsecase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: {
    username: string;
    password: string;
    centerId: string;
  }): Promise<User> {
    const existing = await this.users.findByUsername(input.username);
    if (existing) {
      throw new UserAlreadyExistsError(input.username);
    }

    const passwordHash = await this.hasher.hash(input.password);

    const user = User.createForCenter({
      username: input.username,
      passwordHash,
      centerId: input.centerId,
    });

    await this.users.save(user);
    return user;
  }
}
