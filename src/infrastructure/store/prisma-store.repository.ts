import { Injectable } from '@nestjs/common';
import type {
  StoreRepository,
  StoreFilters,
} from '@domain/store/store.repository';
import { Store } from '@domain/store/store.entity';
import { StoreId } from '@domain/store/value-objects/store-id.vo';
import { CenterId } from '@domain/center/value-objects/center-id.vo';
import { StoreNotFoundError } from '@domain/store/errors';
import { PersistenceError } from '@domain/errors/persistence.error';
import { PrismaService } from '../persistence/prisma/prisma.service';
import { StoreMapper } from './store.mapper';

/**
 * Repository Prisma — Store
 *
 * Rôle :
 * - Adapter technique Prisma
 * - Aucune règle métier ici
 * - Hydratation COMPLÈTE du domaine (images incluses)
 */
@Injectable()
export class PrismaStoreRepository implements StoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ============================
  // SAVE (CREATE / UPDATE)
  // ============================

  async save(store: Store): Promise<void> {
    const data = StoreMapper.toPrisma(store);

    try {
      await this.prisma.store.upsert({
        where: { id: store.id.toString() },
        create: data,
        update: {
          name: data.name,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          phone: data.phone,
          contactName: data.contactName,
          status: data.status,
          images: data.images, // ⭐ IMPORTANT
          statusChangedAt: data.statusChangedAt,
          statusChangedBy: data.statusChangedBy,
          statusReason: data.statusReason,
          updatedAt: data.updatedAt,
        },
      });
    } catch (error) {
      throw new PersistenceError();
    }
  }

  // ============================
  // FIND BY ID
  // ============================

  async findById(id: StoreId): Promise<Store> {
    const store = await this.prisma.store.findUnique({
      where: { id: id.toString() },
      select: {
        id: true,
        centerId: true,
        name: true,
        address: true,
        city: true,
        postalCode: true,
        phone: true,
        contactName: true,
        status: true,
        images: true, // ⭐ OBLIGATOIRE
        statusChangedAt: true,
        statusChangedBy: true,
        statusReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!store) {
      throw new StoreNotFoundError(id.toString());
    }

    return StoreMapper.toDomain(store);
  }

  // ============================
  // FIND ALL (LIST)
  // ============================

  async findAll(filters?: StoreFilters): Promise<Store[]> {
    const stores = await this.prisma.store.findMany({
      where: {
        centerId: filters?.centerId?.toString(),
        city: filters?.city,
        status: filters?.status,
        ...(filters?.statusIn && {
          status: { in: filters.statusIn },
        }),
      },
      select: {
        id: true,
        centerId: true,
        name: true,
        address: true,
        city: true,
        postalCode: true,
        phone: true,
        contactName: true,
        status: true,
        images: true, // ⭐ OBLIGATOIRE
        statusChangedAt: true,
        statusChangedBy: true,
        statusReason: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { status: 'asc' }, // DISPONIBLE d'abord
        { city: 'asc' },
        { name: 'asc' },
      ],
    });

    return stores.map((store) => StoreMapper.toDomain(store));
  }

  // ============================
  // FIND BY CENTER + ADDRESS
  // ============================

  async findByCenterIdAndAddress(
    centerId: CenterId,
    address: string,
    city: string,
    postalCode: string,
  ): Promise<Store | null> {
    const store = await this.prisma.store.findFirst({
      where: {
        centerId: centerId.toString(),
        address,
        city,
        postalCode,
      },
      select: {
        id: true,
        centerId: true,
        name: true,
        address: true,
        city: true,
        postalCode: true,
        phone: true,
        contactName: true,
        status: true,
        images: true, // ⭐ OBLIGATOIRE
        statusChangedAt: true,
        statusChangedBy: true,
        statusReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!store) {
      return null;
    }

    return StoreMapper.toDomain(store);
  }


async findAvailableForCampaignAndCenter(
  campaignId: string,
  centerId: CenterId,
): Promise<Store[]> {
  const stores = await this.prisma.store.findMany({
    where: {
      centerId: centerId.toString(),
      authorizations: {
        some: {
          campaignId,
          status: 'ACTIVE',
        },
      },
    },
    select: {
      id: true,
      centerId: true,
      name: true,
      address: true,
      city: true,
      postalCode: true,
      phone: true,
      contactName: true,
      status: true,
      images: true, // ⭐⭐ LA LIGNE MANQUANTE ⭐⭐
      statusChangedAt: true,
      statusChangedBy: true,
      statusReason: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

 return stores.map((store) => StoreMapper.toDomain(store));

}



}
