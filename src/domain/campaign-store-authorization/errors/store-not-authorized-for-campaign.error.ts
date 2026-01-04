// src/domain/campaign-store-authorization/errors/store-not-authorized-for-campaign.error.ts

import { DomainError } from '@domain/errors/domain-error';

export class StoreNotAuthorizedForCampaignError extends DomainError {
  readonly code = 'STORE_NOT_AUTHORIZED_FOR_CAMPAIGN';

  constructor(campaignId: string, storeId: string) {
    super(`Store ${storeId} is not authorized for campaign ${campaignId}`);
  }
}
