
import { DomainError } from '../../errors/domain-error';
export class ProductArchivedError extends DomainError {
  readonly code = 'PRODUCT_ARCHIVED';

  constructor(reference: string) {
    super(`Product ${reference} is archived`);
  }
}
