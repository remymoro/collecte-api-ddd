// src/domain/campaign/errors/campaign-closed-for-entries.error.ts

import { DomainError } from '@domain/errors/domain-error';

export class CampaignClosedForEntriesError extends DomainError {
  readonly code = 'CAMPAIGN_CLOSED_FOR_ENTRIES';

  constructor(campaignId: string, gracePeriodEndDate: Date) {
    super(
      `Campaign ${campaignId} is closed for new entries. Grace period ended on ${gracePeriodEndDate.toISOString()}`,
    );
  }
}