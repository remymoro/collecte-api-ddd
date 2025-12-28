import { DomainError } from '../../errors/domain-error';

export class EmptyEntryError extends DomainError {
  readonly code = 'ENTRY_EMPTY';

  constructor() {
    super('A collecte entry must contain at least one item');
  }
}
