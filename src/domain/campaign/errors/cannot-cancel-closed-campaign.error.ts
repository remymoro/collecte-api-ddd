// src/domain/campaign/errors/cannot-cancel-closed-campaign.error.ts

import { DomainError } from '@domain/errors/domain-error';

export class CannotCancelClosedCampaignError extends DomainError {
  readonly code = 'CANNOT_CANCEL_CLOSED_CAMPAIGN';

  constructor(campaignId: string) {
    super(`Cannot cancel campaign ${campaignId} because it is already closed`);
  }
}