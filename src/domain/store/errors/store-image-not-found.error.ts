// src/domain/store/errors/store-image-not-found.error.ts

import { DomainError } from '@domain/errors/domain-error';

export class StoreImageNotFoundError extends DomainError {
  readonly code = 'STORE_IMAGE_NOT_FOUND';

  constructor(storeId: string, imageUrl: string) {
    super(`Image "${imageUrl}" not found for store ${storeId}`);
  }
}
