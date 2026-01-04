// src/application/campaign/get-current-campaign.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { Campaign } from '@domain/campaign/campaign.entity';
import type { CampaignRepository } from '@domain/campaign/campaign.repository';
import { CAMPAIGN_REPOSITORY } from '@domain/campaign/campaign.tokens';

@Injectable()
export class GetCurrentCampaignUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: CampaignRepository,
  ) {}

  async execute(): Promise<Campaign | null> {
    return this.campaignRepository.findActiveCampaign();
  }
}
