// src/application/campaign/update-campaign.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { Campaign } from '@domain/campaign/campaign.entity';
import { CampaignId } from '@domain/campaign/value-objects/campaign-id.vo';
import type { CampaignRepository } from '@domain/campaign/campaign.repository';
import { CAMPAIGN_REPOSITORY } from '@domain/campaign/campaign.tokens';
import { CampaignNotFoundError } from '@domain/campaign/errors/campaign-not-found.error';

export interface UpdateCampaignInput {
  campaignId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  gracePeriodEndDate: Date;
  description?: string;
  objectives?: string;
}

@Injectable()
export class UpdateCampaignUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: CampaignRepository,
  ) {}

 async execute(input: UpdateCampaignInput): Promise<Campaign> {
  const id = CampaignId.from(input.campaignId);
  const campaign = await this.campaignRepository.findById(id);

  if (!campaign) {
    throw new CampaignNotFoundError(input.campaignId);
  }

  campaign.updateInfo(
    input.name,
    input.startDate,
    input.endDate,
    input.gracePeriodEndDate,
    input.description,
    input.objectives,
  );

  await this.campaignRepository.update(campaign);

  return campaign;
}
}
