// src/domain/store/errors/store-already-closed.error.ts

import { DomainError } from '@domain/errors/domain-error';

export class StoreAlreadyClosedError extends DomainError {
  readonly code = 'STORE_ALREADY_CLOSED';

  constructor(storeId: string) {
    super(`Store ${storeId} is already closed and cannot be modified`);
  }
}