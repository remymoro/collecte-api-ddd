import type { EntryStatus } from '@domain/collecte/enums/entry-status.enum';
import {
  CollecteEntry,
  type CollecteEntryContext,
  type CollecteEntryItemSnapshot,
} from '@domain/collecte/collecte-entry.entity';
import { CollecteEntryId } from '@domain/collecte/value-objects/collecte-entry-id.vo';
import { CampaignId } from '@domain/campaign/value-objects/campaign-id.vo';
import { StoreId } from '@domain/store/value-objects/store-id.vo';
import { CenterId } from '@domain/center/value-objects/center-id.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';

/**
 * Mapper between Domain CollecteEntry and Prisma models
 * Prisma types are kept OUT of the domain.
 */
export class CollecteEntryMapper {
  // =====================
  // Domain → Prisma
  // =====================

  static toPrisma(entry: CollecteEntry) {
    return {
      id: entry.id.toString(),
      status: entry.status,
      totalKg: entry.totalWeightKg,
      createdAt: entry.createdAt,
      validatedAt: entry.validatedAt ?? null,

      items: {
        create: entry.itemsSnapshot.map((item) => ({
          productRef: item.productRef,
          family: item.family,
          subFamily: item.subFamily,
          weightKg: item.weightKg,
        })),
      },
    };
  }

  // =====================
  // Prisma → Domain
  // =====================

  static toDomain(raw: RawCollecteEntryWithItems): CollecteEntry {
    const items: CollecteEntryItemSnapshot[] = raw.items.map((item) => ({
      productRef: item.productRef,
      family: item.family,
      subFamily: item.subFamily ?? undefined,
      weightKg: toNumber(item.weightKg),
    }));

    const context: CollecteEntryContext = {
      campaignId: CampaignId.from(raw.campaignId),
      storeId: StoreId.from(raw.storeId),
      centerId: CenterId.from(raw.centerId),
      userId: UserId.from(raw.createdBy),
    };

    return CollecteEntry.rehydrate({
      id: CollecteEntryId.from(raw.id),
      context,
      status: raw.status as EntryStatus,
      createdAt: raw.createdAt,
      validatedAt: raw.validatedAt ?? undefined,
      items,
    });
  }
}

type DecimalLike = { toNumber(): number };

type RawCollecteEntryItem = {
  productRef: string;
  family: string;
  subFamily?: string | null;
  weightKg: number | DecimalLike;
};

export type RawCollecteEntryWithItems = {
  id: string;
  status: string;
  campaignId: string;
  storeId: string;
  centerId: string;
  createdBy: string;
  createdAt: Date;
  validatedAt: Date | null;
  items: RawCollecteEntryItem[];
};

function toNumber(value: number | DecimalLike): number {
  return typeof value === 'number' ? value : value.toNumber();
}
