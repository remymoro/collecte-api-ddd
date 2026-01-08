// src/infrastructure/campaign/prisma-campaign.repository.ts

import { Injectable } from '@nestjs/common';

import type { CampaignRepository, CampaignFilters } from
  '@domain/campaign/campaign.repository';
import { Campaign } from '@domain/campaign/campaign.entity';
import { CampaignId } from '@domain/campaign/value-objects/campaign-id.vo';
import { CampaignStatus } from '@domain/campaign/enums/campaign-status.enum';
import { PersistenceError } from '@domain/errors/persistence.error';

import { PrismaService } from '../persistence/prisma/prisma.service';
import { CampaignMapper } from './campaign.mapper';




@Injectable()
export class PrismaCampaignRepository implements CampaignRepository {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // CREATE
  // =========================
  async create(campaign: Campaign): Promise<void> {
    try {
      await this.prisma.campaign.create({
        data: CampaignMapper.toPrisma(campaign),
      });
    } catch {
      throw new PersistenceError();
    }
  }

  // =========================
  // UPDATE
  // =========================
  async update(campaign: Campaign): Promise<void> {
    try {
      await this.prisma.campaign.update({
        where: { id: campaign.id.toString() },
        data: CampaignMapper.toPrisma(campaign),
      });
    } catch {
      throw new PersistenceError();
    }
  }

  // =========================
  // READ
  // =========================
  async findById(id: CampaignId): Promise<Campaign | null> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: id.toString() },
    });

    return campaign ? CampaignMapper.toDomain(campaign) : null;
  }

  async findAll(filters?: CampaignFilters): Promise<Campaign[]> {
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        year: filters?.year,
        status: filters?.status,
      },
      orderBy: [{ year: 'desc' }, { startDate: 'desc' }],
    });

    return campaigns.map(CampaignMapper.toDomain);
  }

  // =========================
  // MÉTIER : CAMPAGNE ACTIVE
  // =========================
  async findActiveCampaign(): Promise<Campaign | null> {
    const campaign = await this.prisma.campaign.findFirst({
      where: {
        status: CampaignStatus.EN_COURS,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return campaign ? CampaignMapper.toDomain(campaign) : null;
  }

  // =========================
  // MÉTIER : SAISIES AUTORISÉES
  // =========================
  async findCampaignAcceptingEntriesForCenter(
    centerId: string,
  ): Promise<Campaign | null> {
    const now = new Date();

    const campaign = await this.prisma.campaign.findFirst({
      where: {
        status: {
          in: [CampaignStatus.EN_COURS, CampaignStatus.TERMINEE],
        },
        gracePeriodEndDate: {
          gte: now,
        },
        authorizations: {
          some: {
            store: {
              centerId,
            },
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return campaign ? CampaignMapper.toDomain(campaign) : null;
  }
}
