// src/presentation/campaign-store-authorization/campaign-center-store-authorization.controller.ts

import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import { StoreAuthorizationView } from './dto/store-authorization.view';
import { ListStoresForCenterCampaignUseCase } from '@application/campaign-store-authorization/list-stores-for-center-campaign.usecase';

/**
 * 🎯 CONCEPT MÉTIER
 * ----------------
 * Ce controller sert une lecture “côté centre” :
 *
 * 👉 « Pour une campagne donnée, et pour un centre donné,
 *      quel est l’état d’autorisation de chacun des magasins de ce centre ? »
 *
 * Contrairement au controller “global” des authorizations :
 * - ici, on ne liste pas seulement les ACTIVE
 * - on retourne une PROJECTION UI : chaque magasin du centre + son statut (ACTIVE/INACTIVE)
 *
 * Lecture humaine (histoire) :
 * - “Je suis admin du centre X et je prépare la campagne Y”
 * - “Je veux voir tous mes magasins et savoir lesquels participent”
 *   → GET /campaigns/:campaignId/centers/:centerId/authorizations
 */
@Controller('campaigns/:campaignId/centers/:centerId/authorizations')
export class CampaignCenterStoreAuthorizationController {
  constructor(
    private readonly listStoresForCenterCampaign: ListStoresForCenterCampaignUseCase,
  ) {}

  /**
   * 📌 GET /campaigns/:campaignId/centers/:centerId/authorizations
   *
   * Intention métier :
   * “Donne-moi l’état de tous les magasins de ce centre
   *  pour cette campagne”
   *
   * 👉 Projection métier pour l’UI
   */
  @Get()
  async list(
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
    @Param('centerId', ParseUUIDPipe) centerId: string,
  ): Promise<StoreAuthorizationView[]> {
    return this.listStoresForCenterCampaign.execute({
      campaignId,
      centerId,
    });
  }
}
