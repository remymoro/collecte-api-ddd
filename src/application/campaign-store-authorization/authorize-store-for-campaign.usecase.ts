// src/application/campaign-store-authorization/authorize-store-for-campaign.usecase.ts

import { Inject, Injectable } from '@nestjs/common';

import { CampaignRepository } from '@domain/campaign/campaign.repository';
import { CAMPAIGN_REPOSITORY } from '@domain/campaign/campaign.tokens';
import { CampaignNotFoundError } from '@domain/campaign/errors/campaign-not-found.error';

import { StoreRepository } from '@domain/store/store.repository';
import { STORE_REPOSITORY } from '@domain/store/store.tokens';
import { StoreNotFoundError } from '@domain/store/errors';

import {
  CampaignStoreAuthorizationRepository,
} from '@domain/campaign-store-authorization/campaign-store-authorization.repository';
import {
  CAMPAIGN_STORE_AUTHORIZATION_REPOSITORY,
} from '@domain/campaign-store-authorization/campaign-store-authorization.tokens';
import { CampaignStoreAuthorization } from '@domain/campaign-store-authorization/campaign-store-authorization.entity';

// ============================
// INPUT
// ============================

export interface AuthorizeStoreForCampaignInput {
  campaignId: string;
  storeId: string;
}

// ============================
// USE CASE
// ============================

@Injectable()
export class AuthorizeStoreForCampaignUseCase {
  constructor(
    /**
     * Le use case dépend uniquement d’ABSTRACTIONS.
     * → DIP respecté
     */
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: CampaignRepository,

    @Inject(STORE_REPOSITORY)
    private readonly storeRepository: StoreRepository,

    @Inject(CAMPAIGN_STORE_AUTHORIZATION_REPOSITORY)
    private readonly authorizationRepository: CampaignStoreAuthorizationRepository,
  ) {}

  async execute(input: AuthorizeStoreForCampaignInput): Promise<void> {
    // ============================
    // 1️⃣ Vérifier que la campagne existe
    // ============================
    const campaign = await this.campaignRepository.findById(input.campaignId);

    if (!campaign) {
      throw new CampaignNotFoundError(input.campaignId);
    }

    // ============================
    // 2️⃣ Vérifier que le magasin existe
    // ============================
    const store = await this.storeRepository.findById(input.storeId);

    if (!store) {
      throw new StoreNotFoundError(input.storeId);
    }

    // ============================
    // 3️⃣ Charger l'autorisation existante (si présente)
    // ============================
    const existing = await this.authorizationRepository.findByCampaignAndStore(
      input.campaignId,
      input.storeId,
    );

    // ============================
    // 4️⃣ Appliquer la règle métier
    // ============================
    if (!existing) {
      const authorization = CampaignStoreAuthorization.createActive(
        input.campaignId,
        input.storeId,
      );

      await this.authorizationRepository.save(authorization);
      return;
    }

    if (existing.isActive) {
      return;
    }

    existing.activate();
    await this.authorizationRepository.save(existing);
  }
}
