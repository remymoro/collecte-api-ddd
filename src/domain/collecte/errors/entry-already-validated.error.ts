import { DomainError } from '../../errors/domain-error';

export class EntryAlreadyValidatedError extends DomainError {
  readonly code = 'ENTRY_ALREADY_VALIDATED';

  constructor() {
    super('The collecte entry is validated and cannot be modified');
  }
}
