import { Inject, Injectable } from '@nestjs/common';
import { CollecteEntry } from '@domain/collecte/collecte-entry.entity';
import type { CollecteEntryRepository } from '@domain/collecte/collecte-entry.repository';
import { CampaignId } from '@domain/campaign/value-objects/campaign-id.vo';
import { StoreId } from '@domain/store/value-objects/store-id.vo';
import { CenterId } from '@domain/center/value-objects/center-id.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';



export type CreateEntryInput = {
  campaignId: string;
  storeId: string;
  centerId: string;
  userId: string;
};

@Injectable()
export class CreateEntryUseCase {
  constructor(
    @Inject('CollecteEntryRepository')
    private readonly entryRepo: CollecteEntryRepository,
  ) {}

  async execute(input: CreateEntryInput): Promise<CollecteEntry> {
    const existing = await this.entryRepo.findActiveByCampaignAndStore(
      CampaignId.from(input.campaignId),
      StoreId.from(input.storeId),
      UserId.from(input.userId),
    );

    if (existing) {
      return existing;
    }

    const entry = CollecteEntry.create({
      campaignId: CampaignId.from(input.campaignId),
      storeId: StoreId.from(input.storeId),
      centerId: CenterId.from(input.centerId),
      userId: UserId.from(input.userId),
    });

    await this.entryRepo.save(entry);
    return entry;
  }
}
