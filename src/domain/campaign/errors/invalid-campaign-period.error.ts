// src/domain/campaign/errors/invalid-campaign-period.error.ts

import { DomainError } from '@domain/errors/domain-error';

export class InvalidCampaignPeriodError extends DomainError {
  readonly code = 'INVALID_CAMPAIGN_PERIOD';

  constructor(message: string) {
    super(message);
  }
}