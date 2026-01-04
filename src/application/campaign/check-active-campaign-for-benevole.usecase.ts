// src/application/campaign/check-active-campaign-for-benevole.usecase.ts

import { Inject, Injectable } from '@nestjs/common';

import { UserRepository } from '@domain/user/user.repository';
import { USER_REPOSITORY } from '@domain/user/user.tokens';
import { CampaignRepository } from '@domain/campaign/campaign.repository';
import { CAMPAIGN_REPOSITORY } from '@domain/campaign/campaign.tokens';

// ============================
// INPUT / OUTPUT
// ============================

export interface CheckCampaignAcceptingEntriesForBenevoleInput {
  userId: string;
}

export interface CheckCampaignAcceptingEntriesForBenevoleOutput {
  canAcceptEntries: boolean;
}

// ============================
// USE CASE
// ============================

@Injectable()
export class CheckCampaignAcceptingEntriesForBenevoleUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: CampaignRepository,
  ) {}

  async execute(
    input: CheckCampaignAcceptingEntriesForBenevoleInput,
  ): Promise<CheckCampaignAcceptingEntriesForBenevoleOutput> {
    // 1. Récupérer le bénévole
    const user = await this.userRepository.findById(input.userId);

    // Si l'utilisateur n'existe pas ou n'est pas rattaché à un centre
    if (!user || !user.centerId) {
      return { canAcceptEntries: false };
    }

    // 2. Chercher une campagne acceptant encore les saisies pour ce centre
    const campaign =
      await this.campaignRepository.findCampaignAcceptingEntriesForCenter(
        user.centerId,
      );

    // 3. Résultat métier explicite
    return {
      canAcceptEntries: campaign !== null,
    };
  }
}
