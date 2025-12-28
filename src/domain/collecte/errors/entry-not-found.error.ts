import { DomainError } from '../../errors/domain-error';

export class EntryNotFoundError extends DomainError {
  readonly code = 'ENTRY_NOT_FOUND';

  constructor() {
    super('Collecte entry not found');
  }
}
