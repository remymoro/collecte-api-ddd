// src/infrastructure/store/store.mapper.ts

import { Store } from '@domain/store/store.entity';
import { StoreStatus } from '@domain/store/enums/store-status.enum';
import { StoreImage } from '@domain/store/value-objects/store-image.vo';
import type { Store as PrismaStore } from '@generated/prisma/client';
import type { PrismaStoreImage } from './prisma-store-image.type';

export class StoreMapper {
  // ============================
  // Prisma → Domain
  // ============================

  static toDomain(prisma: PrismaStore): Store {
    return Store.rehydrate({
      id: prisma.id,
      centerId: prisma.centerId,
      name: prisma.name,
      address: prisma.address,
      city: prisma.city,
      postalCode: prisma.postalCode,
      phone: prisma.phone ?? undefined,
      contactName: prisma.contactName ?? undefined,
      status: prisma.status as StoreStatus,
      statusChangedAt: prisma.statusChangedAt ?? undefined,
      statusChangedBy: prisma.statusChangedBy ?? undefined,
      statusReason: prisma.statusReason ?? undefined,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
      images: this.mapImagesToDomain(prisma.images),
    });
  }

  // ============================
  // Domain → Prisma
  // ============================

  static toPrisma(domain: Store) {
    return {
      id: domain.id,
      centerId: domain.centerId,
      name: domain.name,
      address: domain.address,
      city: domain.city,
      postalCode: domain.postalCode,
      phone: domain.phone ?? null,
      contactName: domain.contactName ?? null,
      status: domain.status,
      statusChangedAt: domain.statusChangedAt ?? null,
      statusChangedBy: domain.statusChangedBy ?? null,
      statusReason: domain.statusReason ?? null,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      images: this.mapImagesToPrisma(domain.images),
    };
  }

  // ============================
  // IMAGES — Mapping privé
  // ============================

  /**
   * JSON (Prisma) → StoreImage[]
   */
  private static mapImagesToDomain(images: unknown): StoreImage[] {
    if (!Array.isArray(images)) {
      return [];
    }

    return (images as PrismaStoreImage[])
      .filter(
        (img) =>
          typeof img?.url === 'string' &&
          typeof img?.isPrimary === 'boolean',
      )
      .map((img) => StoreImage.create(img.url, img.isPrimary));
  }

  /**
   * StoreImage[] → JSON (Prisma)
   */
  private static mapImagesToPrisma(
    images: StoreImage[],
  ): PrismaStoreImage[] {
    return images.map((img) => ({
      url: img.url,
      isPrimary: img.isPrimary,
    }));
  }
}
