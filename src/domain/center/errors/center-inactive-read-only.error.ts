import { DomainError } from '@domain/errors/domain-error';

export class CenterInactiveReadOnlyError extends DomainError {
  readonly code = 'CENTER_INACTIVE_READONLY';

  constructor(centerId: string) {
    super(`Center ${centerId} is inactive and therefore read-only`);
  }
}
