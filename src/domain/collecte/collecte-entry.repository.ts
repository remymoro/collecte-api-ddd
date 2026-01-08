import { CollecteEntry } from './collecte-entry.entity';
import { CollecteEntryId } from './value-objects/collecte-entry-id.vo';
import { CampaignId } from '@domain/campaign/value-objects/campaign-id.vo';
import { StoreId } from '@domain/store/value-objects/store-id.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';

export interface CollecteEntryRepository {
  save(entry: CollecteEntry): Promise<void>;
  findActiveByCampaignAndStore(
    campaignId: CampaignId,
    storeId: StoreId,
    userId: UserId,
  ): Promise<CollecteEntry | null>;
  findAll(): Promise<CollecteEntry[]>;
  findById(id: CollecteEntryId): Promise<CollecteEntry>;
}
