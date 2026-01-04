import {
  CampaignStoreAuthorization,
} from '@domain/campaign-store-authorization/campaign-store-authorization.entity';

import {
  CampaignStoreAuthorization as PrismaAuthorization,
} from '@generated/prisma/client';

export class CampaignStoreAuthorizationMapper {
  static toDomain(prisma: PrismaAuthorization): CampaignStoreAuthorization {
    return CampaignStoreAuthorization.rehydrate({
      id: prisma.id,
      campaignId: prisma.campaignId,
      storeId: prisma.storeId,
      status: prisma.status,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }

  static toPrisma(domain: CampaignStoreAuthorization) {
    return {
      id: domain.id,
      campaignId: domain.campaignId,
      storeId: domain.storeId,
      status: domain.status,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }
}
