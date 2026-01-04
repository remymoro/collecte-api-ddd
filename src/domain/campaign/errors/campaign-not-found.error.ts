// src/domain/campaign/errors/campaign-not-found.error.ts

import { DomainError } from '@domain/errors/domain-error';

export class CampaignNotFoundError extends DomainError {
  readonly code = 'CAMPAIGN_NOT_FOUND';

  constructor(campaignId: string) {
    super(`Campaign with id ${campaignId} not found`);
  }
}