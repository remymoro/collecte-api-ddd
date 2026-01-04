import { DomainError } from '@domain/errors/domain-error';

export class CenterIdRequiredError extends DomainError {
  readonly code = 'CENTER_ID_REQUIRED';

  constructor() {
    super('centerId is required');
  }
}