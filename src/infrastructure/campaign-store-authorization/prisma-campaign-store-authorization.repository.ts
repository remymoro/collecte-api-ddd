import { Injectable } from '@nestjs/common';

import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';

import {
  CampaignStoreAuthorizationRepository,
} from '@domain/campaign-store-authorization/campaign-store-authorization.repository';

import {
  CampaignStoreAuthorization,
} from '@domain/campaign-store-authorization/campaign-store-authorization.entity';

import type { CampaignStoreAuthorizationStatus } from '@domain/campaign-store-authorization/campaign-store-authorization.entity';

import { CampaignStoreAuthorizationMapper } from './campaign-store-authorization.mapper';

import { PersistenceError } from '@domain/errors/persistence.error';

@Injectable()
export class PrismaCampaignStoreAuthorizationRepository
  implements CampaignStoreAuthorizationRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async save(authorization: CampaignStoreAuthorization): Promise<void> {
    try {
      await this.prisma.campaignStoreAuthorization.upsert({
        where: {
          campaignId_storeId: {
            campaignId: authorization.campaignId,
            storeId: authorization.storeId,
          },
        },
        create: CampaignStoreAuthorizationMapper.toPrisma(authorization),
        update: {
          status: authorization.status,
          updatedAt: authorization.updatedAt,
        },
      });
    } catch {
      throw new PersistenceError();
    }
  }

  async findByCampaignAndStore(
    campaignId: string,
    storeId: string,
  ): Promise<CampaignStoreAuthorization | null> {
    const row = await this.prisma.campaignStoreAuthorization.findUnique({
      where: {
        campaignId_storeId: {
          campaignId,
          storeId,
        },
      },
    });

    return row ? CampaignStoreAuthorizationMapper.toDomain(row) : null;
  }

  async findStoreIdsByCampaign(
    campaignId: string,
    status?: CampaignStoreAuthorizationStatus,
  ): Promise<string[]> {
    const rows = await this.prisma.campaignStoreAuthorization.findMany({
      where: {
        campaignId,
        ...(status ? { status } : {}),
      },
      select: { storeId: true },
    });

    return rows.map((r) => r.storeId);
  }

  async findByCampaignAndStoreIds(
    campaignId: string,
    storeIds: string[],
  ): Promise<CampaignStoreAuthorization[]> {
    if (storeIds.length === 0) {
      return [];
    }

    const rows = await this.prisma.campaignStoreAuthorization.findMany({
      where: {
        campaignId,
        storeId: { in: storeIds },
      },
    });

    return rows.map((row) => CampaignStoreAuthorizationMapper.toDomain(row));
  }
}
