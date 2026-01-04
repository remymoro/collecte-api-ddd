// src/domain/campaign/campaign.repository.ts

import type { Campaign } from './campaign.entity';
import type { CampaignStatus } from './enums/campaign-status.enum';

export interface CampaignFilters {
  year?: number;
  status?: CampaignStatus;
  statusIn?: CampaignStatus[];
}

export abstract class CampaignRepository {
  abstract create(campaign: Campaign): Promise<void>;
  abstract update(campaign: Campaign): Promise<void>;
  abstract findById(id: string): Promise<Campaign | null>;
  abstract findAll(filters?: CampaignFilters): Promise<Campaign[]>;

  /**
   * Retourne la campagne actuellement ACTIVE.
   * Règle métier : status === EN_COURS
   */
  abstract findActiveCampaign(): Promise<Campaign | null>;

  /**
   * Retourne la campagne pour laquelle les saisies sont encore autorisées
   * pour un centre donné.
   *
   * Règle métier (Campaign.canAcceptEntries) :
   * - status === EN_COURS ou TERMINEE
   * - ET date courante <= gracePeriodEndDate
   */
  abstract findCampaignAcceptingEntriesForCenter(
    centerId: string,
  ): Promise<Campaign | null>;
}
