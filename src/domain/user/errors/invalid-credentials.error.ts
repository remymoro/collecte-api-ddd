import { DomainError } from '@domain/errors/domain-error';

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';

  constructor() {
    super('Invalid username or password');
  }
}
