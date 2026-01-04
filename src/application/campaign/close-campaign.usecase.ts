// src/application/campaign/close-campaign.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { Campaign } from '@domain/campaign/campaign.entity';
import type { CampaignRepository } from '@domain/campaign/campaign.repository';
import { CAMPAIGN_REPOSITORY } from '@domain/campaign/campaign.tokens';
import { CampaignNotFoundError } from '@domain/campaign/errors/campaign-not-found.error';

export interface CloseCampaignInput {
  campaignId: string;
  closedBy: string;
}

@Injectable()
export class CloseCampaignUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: CampaignRepository,
  ) {}

 async execute(input: CloseCampaignInput): Promise<Campaign> {
  const campaign = await this.campaignRepository.findById(input.campaignId);

  if (!campaign) {
    throw new CampaignNotFoundError(input.campaignId);
  }

  campaign.close(input.closedBy);

  await this.campaignRepository.update(campaign);

  return campaign;
}
}
