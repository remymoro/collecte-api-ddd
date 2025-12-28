import { DomainError } from '../../errors/domain-error';

export class InvalidWeightError extends DomainError {
  readonly code = 'INVALID_WEIGHT';

  constructor() {
    super('Weight must be a positive number');
  }
}
