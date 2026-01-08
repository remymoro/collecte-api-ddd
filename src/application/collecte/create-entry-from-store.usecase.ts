// src/application/collecte/create-entry-from-store.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { CollecteEntry } from '@domain/collecte/collecte-entry.entity';
import type { StoreRepository } from '@domain/store/store.repository';
import type { CampaignRepository } from '@domain/campaign/campaign.repository';
import { CampaignId } from '@domain/campaign/value-objects/campaign-id.vo';
import { COLLECTE_ENTRY_REPOSITORY } from '@domain/collecte/collecte-entry.tokens';
import { STORE_REPOSITORY } from '@domain/store/store.tokens';
import { CAMPAIGN_REPOSITORY } from '@domain/campaign/campaign.tokens';
import { UnauthorizedCenterAccessError } from '@domain/errors/unauthorized-center-access.error';
import { CampaignClosedForEntriesError } from '@domain/campaign/errors/campaign-closed-for-entries.error';
import { CampaignNotFoundError } from '@domain/campaign/errors/campaign-not-found.error';
import { CollecteEntryRepository } from '@domain/collecte/collecte-entry.repository';
import type { CenterRepository } from '@domain/center/center.repository';
import { CenterId } from '@domain/center/value-objects/center-id.vo';
import { CENTER_REPOSITORY } from '@domain/center/center.tokens';
import { CenterNotFoundError } from '@domain/center/errors';
import { StoreId } from '@domain/store/value-objects/store-id.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';

export interface CreateEntryFromStoreInput {
  campaignId: string;
  storeId: string;
  userId: string;
  userCenterId: string;
}

@Injectable()
export class CreateEntryFromStoreUseCase {
  constructor(
    @Inject(COLLECTE_ENTRY_REPOSITORY)
    private readonly entryRepository: CollecteEntryRepository,
    @Inject(STORE_REPOSITORY)
    private readonly storeRepository: StoreRepository,
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: CampaignRepository,

    @Inject(CENTER_REPOSITORY)
    private readonly centerRepository: CenterRepository,
  ) {}

  async execute(input: CreateEntryFromStoreInput): Promise<CollecteEntry> {
    // Vérifier que le magasin existe
    const store = await this.storeRepository.findById(StoreId.from(input.storeId));

    // Vérifier que le bénévole appartient au même centre
    if (store.centerId.toString() !== input.userCenterId) {
      throw new UnauthorizedCenterAccessError(
        'You do not have access to this store',
      );
    }

    const center = await this.centerRepository.findById(CenterId.from(input.userCenterId));
    if (!center) {
      throw new CenterNotFoundError(input.userCenterId);
    }
    center.assertActive();

    // Vérifier que la campagne accepte encore des saisies
    const campaign = await this.campaignRepository.findById(CampaignId.from(input.campaignId));

    if (!campaign) {
      throw new CampaignNotFoundError(input.campaignId);
    }

    if (!campaign.canAcceptEntries()) {
      throw new CampaignClosedForEntriesError(
        campaign.id.toString(),
        campaign.gracePeriodEndDate,
      );
    }

    // Créer l'entry
    const entry = CollecteEntry.create({
      campaignId: CampaignId.from(input.campaignId),
      storeId: StoreId.from(input.storeId),
      centerId: CenterId.from(input.userCenterId),
      userId: UserId.from(input.userId),
    });

    await this.entryRepository.save(entry);

    return entry;
  }
}
