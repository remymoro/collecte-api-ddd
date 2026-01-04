// src/application/campaign-store-authorization/list-authorized-stores-for-campaign.usecase.ts

import { Inject, Injectable } from '@nestjs/common';

import type { CampaignStoreAuthorizationStatus } from '@domain/campaign-store-authorization/campaign-store-authorization.entity';

import {
  CampaignStoreAuthorizationRepository,
} from '@domain/campaign-store-authorization/campaign-store-authorization.repository';
import {
  CAMPAIGN_STORE_AUTHORIZATION_REPOSITORY,
} from '@domain/campaign-store-authorization/campaign-store-authorization.tokens';

// ============================
// INPUT
// ============================

export interface ListAuthorizedStoresForCampaignInput {
  campaignId: string;
  status?: CampaignStoreAuthorizationStatus;
}

// ============================
// USE CASE
// ============================

@Injectable()
export class ListAuthorizedStoresForCampaignUseCase {
  constructor(
    @Inject(CAMPAIGN_STORE_AUTHORIZATION_REPOSITORY)
    private readonly authorizationRepository: CampaignStoreAuthorizationRepository,
  ) {}

  async execute(input: ListAuthorizedStoresForCampaignInput): Promise<string[]> {
    return this.authorizationRepository.findStoreIdsByCampaign(
      input.campaignId,
      input.status ?? 'ACTIVE',
    );
  }
}
