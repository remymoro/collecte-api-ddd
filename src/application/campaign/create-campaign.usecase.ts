// src/application/campaign/create-campaign.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { Campaign } from '@domain/campaign/campaign.entity';
import type { CampaignRepository } from '@domain/campaign/campaign.repository';
import { CAMPAIGN_REPOSITORY } from '@domain/campaign/campaign.tokens';
import { CampaignYearAlreadyExistsError } from '@domain/campaign/errors/campaign-year-already-exists.error';

export interface CreateCampaignInput {
  name: string;
  year: number;
  startDate: Date;
  endDate: Date;
  gracePeriodDays: number;
  createdBy: string;
  description?: string;
  objectives?: string;
}

@Injectable()
export class CreateCampaignUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: CampaignRepository,
  ) {}

  async execute(input: CreateCampaignInput): Promise<Campaign> {
  const existing = await this.campaignRepository.findAll({
    year: input.year,
  });

  if (existing.length > 0) {
    throw new CampaignYearAlreadyExistsError(input.year);
  }

  const campaign = Campaign.create(
    input.name,
    input.year,
    input.startDate,
    input.endDate,
    input.gracePeriodDays,
    input.createdBy,
    input.description,
    input.objectives,
  );

  await this.campaignRepository.create(campaign);

  return campaign;
  }
}
