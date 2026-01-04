// src/infrastructure/campaign/campaign.mapper.ts

import { Campaign } from '@domain/campaign/campaign.entity';
import { CampaignStatus } from '@domain/campaign/enums/campaign-status.enum';
import type { Campaign as PrismaCampaign } from '@generated/prisma/client';

export class CampaignMapper {
  static toDomain(prisma: PrismaCampaign): Campaign {
    return Campaign.rehydrate({
      id: prisma.id,
      name: prisma.name,
      year: prisma.year,
      startDate: prisma.startDate,
      endDate: prisma.endDate,
      gracePeriodEndDate: prisma.gracePeriodEndDate,
      status: prisma.status as CampaignStatus,
      description: prisma.description ?? undefined,
      objectives: prisma.objectives ?? undefined,
      createdBy: prisma.createdBy,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
      closedBy: prisma.closedBy ?? undefined,
      closedAt: prisma.closedAt ?? undefined,
    });
  }

  static toPrisma(domain: Campaign) {
    return {
      id: domain.id,
      name: domain.name,
      year: domain.year,
      startDate: domain.startDate,
      endDate: domain.endDate,
      gracePeriodEndDate: domain.gracePeriodEndDate,
      status: domain.status,
      description: domain.description ?? null,
      objectives: domain.objectives ?? null,
      createdBy: domain.createdBy,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      closedBy: domain.closedBy ?? null,
      closedAt: domain.closedAt ?? null,
    };
  }
}