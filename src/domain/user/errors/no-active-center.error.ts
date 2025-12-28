import { DomainError } from '@domain/errors/domain-error';

export class NoActiveCenterError extends DomainError {
  readonly code = 'NO_ACTIVE_CENTER';

  constructor() {
    super('User has no active center');
  }
}
