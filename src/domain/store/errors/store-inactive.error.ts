// src/domain/store/errors/store-inactive.error.ts

import { DomainError } from '@domain/errors/domain-error';

export class StoreInactiveError extends DomainError {
  readonly code = 'STORE_INACTIVE';

  constructor(storeId: string) {
    super(`Store ${storeId} is inactive`);
  }
}