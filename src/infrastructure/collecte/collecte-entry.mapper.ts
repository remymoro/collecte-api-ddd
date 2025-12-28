import type { EntryStatus } from '../../domain/collecte/enums/entry-status.enum';
import {
  CollecteEntry,
  type CollecteEntryItemSnapshot,
} from '../../domain/collecte/collecte-entry.entity';

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
      id: entry.id,
      status: entry.entryStatus,
      totalKg: entry.totalWeightKg,
      createdAt: entry.entryCreatedAt,
      validatedAt: entry.validatedAt ?? null,

      items: {
        create: entry.entryItems.map((item) => ({
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

    return CollecteEntry.rehydrate({
      id: raw.id,
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
  createdAt: Date;
  validatedAt: Date | null;
  items: RawCollecteEntryItem[];
};

function toNumber(value: number | DecimalLike): number {
  return typeof value === 'number' ? value : value.toNumber();
}
