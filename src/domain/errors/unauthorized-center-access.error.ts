// src/domain/errors/unauthorized-center-access.error.ts

import { DomainError } from '@domain/errors/domain-error';

export class UnauthorizedCenterAccessError extends DomainError {
  readonly code = 'UNAUTHORIZED_CENTER_ACCESS';

  constructor(message?: string) {
    super(message ?? 'User does not have access to this center');
  }
}