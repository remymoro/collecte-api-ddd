import { DomainError } from '@domain/errors/domain-error';

export class UserAlreadyExistsError extends DomainError {
  readonly code = 'USER_ALREADY_EXISTS';

  constructor(username: string) {
    super(`User with username "${username}" already exists`);
  }
}
