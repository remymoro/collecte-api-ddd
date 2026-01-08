// src/application/campaign-store-authorization/list-stores-for-center-campaign.usecase.ts

import { Inject, Injectable } from '@nestjs/common';

import type { StoreRepository } from '@domain/store/store.repository';
import { STORE_REPOSITORY } from '@domain/store/store.tokens';

import type { CampaignStoreAuthorizationRepository } from '@domain/campaign-store-authorization/campaign-store-authorization.repository';
import { CAMPAIGN_STORE_AUTHORIZATION_REPOSITORY } from '@domain/campaign-store-authorization/campaign-store-authorization.tokens';

import type { StoreAuthorizationView } from '@presentation/campaign-store-authorization/dto/store-authorization.view';
import { CenterId } from '@domain/center/value-objects/center-id.vo';


type ListStoresForCenterCampaignInput = {
  campaignId: string;
  centerId: string;
};

@Injectable()
export class ListStoresForCenterCampaignUseCase {
  constructor(
    @Inject(STORE_REPOSITORY)
    private readonly storeRepository: StoreRepository,

    @Inject(CAMPAIGN_STORE_AUTHORIZATION_REPOSITORY)
    private readonly authorizationRepository: CampaignStoreAuthorizationRepository,
  ) {}

  async execute(
    input: ListStoresForCenterCampaignInput,
  ): Promise<StoreAuthorizationView[]> {
    const { campaignId, centerId } = input;

    // 1️⃣ Charger TOUS les magasins du centre
    const stores = await this.storeRepository.findAll({ centerId: CenterId.from(centerId) });

    // 2️⃣ Charger les autorisations existantes pour ces magasins (bulk)
    //    → permet de distinguer INACTIVE (existe) de NONE (n'existe pas)
    const storeIds = stores.map((s) => s.id.toString());
    const authorizations = await this.authorizationRepository.findByCampaignAndStoreIds(
      campaignId,
      storeIds,
    );

    const statusByStoreId = new Map(
      authorizations.map((a) => [a.storeId, a.status] as const),
    );

    // 3️⃣ Construire une vue métier lisible pour l’UI
    return stores.map((store) => {
      const status = statusByStoreId.get(store.id.toString());

      return {
        storeId: store.id.toString(),
        storeName: store.name,
        address: store.address,
        authorizationStatus: status ?? 'NONE',
      };
    });
  }
}
