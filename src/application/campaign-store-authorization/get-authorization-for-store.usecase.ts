import { Inject, Injectable } from '@nestjs/common';

import type { CampaignRepository } from '@domain/campaign/campaign.repository';
import { CAMPAIGN_REPOSITORY } from '@domain/campaign/campaign.tokens';
import { CampaignNotFoundError } from '@domain/campaign/errors/campaign-not-found.error';
import { CampaignId } from '@domain/campaign/value-objects/campaign-id.vo';

import type { StoreRepository } from '@domain/store/store.repository';
import { STORE_REPOSITORY } from '@domain/store/store.tokens';
import { StoreNotFoundError } from '@domain/store/errors';
import { StoreId } from '@domain/store/value-objects/store-id.vo';

import type {
  CampaignStoreAuthorizationRepository,
} from '@domain/campaign-store-authorization/campaign-store-authorization.repository';
import {
  CAMPAIGN_STORE_AUTHORIZATION_REPOSITORY,
} from '@domain/campaign-store-authorization/campaign-store-authorization.tokens';
import { StoreNotAuthorizedForCampaignError } from '@domain/campaign-store-authorization/errors/store-not-authorized-for-campaign.error';
import type { CampaignStoreAuthorizationStatus } from '@domain/campaign-store-authorization/campaign-store-authorization.entity';

export interface GetAuthorizationForStoreInput {
  campaignId: string;
  storeId: string;
}

export interface GetAuthorizationForStoreOutput {
  campaignId: string;
  storeId: string;
  status: CampaignStoreAuthorizationStatus;
}

@Injectable()
export class GetAuthorizationForStoreUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: CampaignRepository,

    @Inject(STORE_REPOSITORY)
    private readonly storeRepository: StoreRepository,

    @Inject(CAMPAIGN_STORE_AUTHORIZATION_REPOSITORY)
    private readonly authorizationRepository: CampaignStoreAuthorizationRepository,
  ) {}

  async execute(
    input: GetAuthorizationForStoreInput,
  ): Promise<GetAuthorizationForStoreOutput> {
    const campaign = await this.campaignRepository.findById(CampaignId.from(input.campaignId));
    if (!campaign) {
      throw new CampaignNotFoundError(input.campaignId);
    }

    const store = await this.storeRepository.findById(StoreId.from(input.storeId));
    if (!store) {
      throw new StoreNotFoundError(input.storeId);
    }

    const authorization = await this.authorizationRepository.findByCampaignAndStore(
      input.campaignId,
      input.storeId,
    );

    if (!authorization) {
      throw new StoreNotAuthorizedForCampaignError(input.campaignId, input.storeId);
    }

    return {
      campaignId: authorization.campaignId,
      storeId: authorization.storeId,
      status: authorization.status,
    };
  }
}
