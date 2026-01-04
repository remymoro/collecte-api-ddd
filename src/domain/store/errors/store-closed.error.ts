// src/domain/store/errors/store-closed.error.ts

import { DomainError } from '@domain/errors/domain-error';

export class StoreClosedError extends DomainError {
  readonly code = 'STORE_CLOSED';

  constructor(storeId: string) {
    super(`Store ${storeId} is permanently closed`);
  }
}