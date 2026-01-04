// src/domain/campaign/errors/campaign-cannot-be-modified.error.ts

import { DomainError } from '@domain/errors/domain-error';

export class CampaignCannotBeModifiedError extends DomainError {
  readonly code = 'CAMPAIGN_CANNOT_BE_MODIFIED';

  constructor(campaignId: string, reason?: string) {
    const message = reason
      ? `Campaign ${campaignId} cannot be modified: ${reason}`
      : `Campaign ${campaignId} cannot be modified`;
    super(message);
  }
}