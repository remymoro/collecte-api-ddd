import { DomainError } from '../../errors/domain-error';

export class ProductNotFoundError extends DomainError {
  readonly code = 'PRODUCT_NOT_FOUND';

  constructor(reference: string) {
    super(`Product ${reference} not found`);
  }
}
