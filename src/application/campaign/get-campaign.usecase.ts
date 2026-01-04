// src/application/campaign/get-campaign.usecase.ts

import { Inject, Injectable } from '@nestjs/common';

import { Campaign } from '@domain/campaign/campaign.entity';
import { CampaignNotFoundError } from '@domain/campaign/errors/campaign-not-found.error';

import type { CampaignRepository } from '@domain/campaign/campaign.repository';
import { CAMPAIGN_REPOSITORY } from '@domain/campaign/campaign.tokens';

// ============================
// INPUT / OUTPUT
// ============================

export interface GetCampaignInput {
  campaignId: string;
}

export interface GetCampaignOutput {
  campaign: Campaign;
}

// ============================
// USE CASE
// ============================

@Injectable()
export class GetCampaignUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: CampaignRepository,
  ) {}

  async execute(input: GetCampaignInput): Promise<GetCampaignOutput> {
    const campaign = await this.campaignRepository.findById(input.campaignId);

    if (!campaign) {
      throw new CampaignNotFoundError(input.campaignId);
    }

    return { campaign };
  }
}
