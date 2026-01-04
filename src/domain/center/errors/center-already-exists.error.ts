import { DomainError } from '@domain/errors/domain-error';

export class CenterAlreadyExistsError extends DomainError {
  readonly code = 'CENTER_ALREADY_EXISTS';

  constructor(name: string, city: string) {
    super(`Center "${name}" already exists in city "${city}"`);
  }
}
