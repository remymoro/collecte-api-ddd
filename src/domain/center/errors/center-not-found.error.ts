import { DomainError } from '@domain/errors/domain-error';

export class CenterNotFoundError extends DomainError {
  readonly code = 'CENTER_NOT_FOUND';

  constructor(centerId: string) {
    super(`Center with id "${centerId}" not found`);
  }
}
