// src/application/campaign/list-campaigns.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { Campaign } from '@domain/campaign/campaign.entity';
import { CampaignStatus } from '@domain/campaign/enums/campaign-status.enum';
import type { CampaignRepository } from '@domain/campaign/campaign.repository';
import { CAMPAIGN_REPOSITORY } from '@domain/campaign/campaign.tokens';

// ============================
// INPUT
// ============================

export interface ListCampaignsInput {
  year?: number;
  status?: CampaignStatus;
}

// ============================
// USE CASE
// ============================

@Injectable()
export class ListCampaignsUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: CampaignRepository,
  ) {}

  async execute(input: ListCampaignsInput): Promise<Campaign[]> {
    return this.campaignRepository.findAll({
      year: input.year,
      status: input.status,
    });
  }
}
