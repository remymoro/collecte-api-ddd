import { DomainError } from './domain-error';

export class PersistenceError extends DomainError {
  readonly code = 'PERSISTENCE_ERROR';

  constructor(message: string = 'PERSISTENCE_ERROR') {
    super(message);
  }
}
