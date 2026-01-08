import { DomainError } from '@domain/errors/domain-error';

export class CampaignValidationError extends DomainError {
  readonly code = 'CAMPAIGN_VALIDATION_ERROR';

  constructor(
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message, details);
  }
}
