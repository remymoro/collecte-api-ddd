// src/domain/store/errors/store-unavailable.error.ts
// src/domain/store/errors/store-unavailable.error.ts

import { DomainError } from '@domain/errors/domain-error';

export class StoreUnavailableError extends DomainError {
  readonly code = 'STORE_UNAVAILABLE';

  constructor(storeId: string, reason?: string) {  // ⭐ Optionnel
    const message = reason
      ? `Store ${storeId} is unavailable: ${reason}`
      : `Store ${storeId} is unavailable for collection`;
    super(message);
  }
}