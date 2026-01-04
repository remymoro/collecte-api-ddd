// src/domain/campaign/errors/invalid-status-transition.error.ts

import { DomainError } from '@domain/errors/domain-error';

export class InvalidStatusTransitionError extends DomainError {
  readonly code = 'INVALID_STATUS_TRANSITION';

  constructor(from: string, to: string) {
    super(`Cannot transition campaign status from ${from} to ${to}`);
  }
}