// src/domain/store/errors/cannot-modify-closed-store.error.ts

import { DomainError } from '@domain/errors/domain-error';

export class CannotModifyClosedStoreError extends DomainError {
  readonly code = 'CANNOT_MODIFY_CLOSED_STORE';

  constructor(storeId: string) {
    super(`Cannot modify store ${storeId} because it is permanently closed`);
  }
}