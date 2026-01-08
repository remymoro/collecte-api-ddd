import { CollecteEntry } from '@domain/collecte/collecte-entry.entity';
import { CollecteEntryRepository } from '@domain/collecte/collecte-entry.repository';
import { EntryStatus } from '@domain/collecte/enums/entry-status.enum';
import { EntryNotFoundError } from '@domain/collecte/errors/entry-not-found.error';
import { CollecteEntryId } from '@domain/collecte/value-objects/collecte-entry-id.vo';
import { CampaignId } from '@domain/campaign/value-objects/campaign-id.vo';
import { StoreId } from '@domain/store/value-objects/store-id.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';

export class InMemoryCollecteEntryRepository
  implements CollecteEntryRepository
{
  private readonly entries = new Map<string, CollecteEntry>();

  async save(entry: CollecteEntry): Promise<void> {
    const snapshot = CollecteEntry.rehydrate({
      id: entry.id,
      context: {
        campaignId: entry.campaignId,
        storeId: entry.storeId,
        centerId: entry.centerId,
        userId: entry.createdBy,
      },
      status: entry.status,
      createdAt: entry.createdAt,
      validatedAt: entry.validatedAt,
      items: entry.itemsSnapshot.map(item => ({ ...item })), // ✅
    });

    this.entries.set(entry.id.toString(), snapshot);
  }

  async findActiveByCampaignAndStore(
    campaignId: CampaignId,
    storeId: StoreId,
    userId: UserId,
  ): Promise<CollecteEntry | null> {
    const candidates = Array.from(this.entries.values()).filter(
      (entry) =>
        entry.status === EntryStatus.EN_COURS &&
        entry.campaignId.equals(campaignId) &&
        entry.storeId.equals(storeId) &&
        entry.createdBy.equals(userId),
    );

    if (candidates.length === 0) {
      return null;
    }

    candidates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return candidates[0];
  }

  async findById(id: CollecteEntryId): Promise<CollecteEntry> {
    const entry = this.entries.get(id.toString());
    if (!entry) {
      throw new EntryNotFoundError();
    }
    return entry;
  }

  async findAll(): Promise<CollecteEntry[]> {
    return Array.from(this.entries.values());
  }
}
