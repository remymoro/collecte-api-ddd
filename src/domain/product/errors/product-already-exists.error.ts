// src/domain/product/errors/product-already-exists.error.ts

import { DomainError } from '../../errors/domain-error';

export class ProductAlreadyExistsError extends DomainError {
  readonly code = 'PRODUCT_ALREADY_EXISTS';

  constructor(reference: string) {
    super(`Product with reference "${reference}" already exists`);
  }
}
