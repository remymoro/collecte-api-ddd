// src/domain/store/errors/store-not-found.error.ts

import { DomainError } from '@domain/errors/domain-error';



export class StoreNotFoundError extends DomainError {
  readonly code = 'STORE_NOT_FOUND';

  constructor(storeId: string) {
    super(`Store with id ${storeId} not found`);
  }
}