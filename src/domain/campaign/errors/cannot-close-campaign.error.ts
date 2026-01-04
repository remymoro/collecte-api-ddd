// src/domain/campaign/errors/cannot-close-campaign.error.ts

import { DomainError } from '@domain/errors/domain-error';

export class CannotCloseCampaignError extends DomainError {
  readonly code = 'CANNOT_CLOSE_CAMPAIGN';

  constructor(reason: string) {
    super(`Cannot close campaign: ${reason}`);
  }
}