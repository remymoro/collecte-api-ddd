import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { AuthorizeStoreForCampaignUseCase } from '@application/campaign-store-authorization/authorize-store-for-campaign.usecase';
import { DeactivateStoreForCampaignUseCase } from '@application/campaign-store-authorization/deactivate-store-for-campaign.usecase';
import { ListAuthorizedStoresForCampaignUseCase } from '@application/campaign-store-authorization/list-authorized-stores-for-campaign.usecase';
import { GetAuthorizationForStoreUseCase } from '@application/campaign-store-authorization/get-authorization-for-store.usecase';

import { ActivateStoreDto } from './dto/activate-store.dto';
import { ListAuthorizationsQueryDto } from './dto/list-authorizations.query.dto';

/**
 * 🎯 CONCEPT MÉTIER
 * ----------------
 * Ce controller expose un fait métier simple :
 *
 * 👉 « Pour une campagne donnée, quels magasins sont AUTORISÉS ? »
 *
 * On ne “gère” pas un magasin ici.
 * On ne “gère” pas une campagne ici.
 * On gère une décision administrative : l’autorisation d’un magasin à participer.
 *
 * Lecture humaine (histoire) :
 * 1) “Je veux autoriser Carrefour pour la campagne 2025”
 *    → POST /campaigns/:campaignId/authorizations   { storeId }
 * 2) “Leclerc n'est plus dispo, je le désactive”
 *    → PATCH /campaigns/:campaignId/authorizations/:storeId/deactivate
 * 3) “Leclerc est de nouveau dispo, je le réactive”
 *    → PATCH /campaigns/:campaignId/authorizations/:storeId/activate
 * 4) “Quels magasins sont autorisés ?”
 *    → GET /campaigns/:campaignId/authorizations?status=ACTIVE|INACTIVE
 * 5) “Ce magasin est-il autorisé ? (détail)”
 *    → GET /campaigns/:campaignId/authorizations/:storeId
 *
 * 🧠 Note importante :
 * - La logique métier (idempotence, existence campagne/magasin, etc.) vit dans les USE CASES.
 * - Le controller ne fait que : valider, extraire les ids, appeler le bon use case.
 */
@Controller('campaigns/:campaignId/authorizations')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class CampaignStoreAuthorizationController {
  constructor(
    private readonly authorizeStoreForCampaignUseCase: AuthorizeStoreForCampaignUseCase,
    private readonly deactivateStoreForCampaignUseCase: DeactivateStoreForCampaignUseCase,
    private readonly listAuthorizedStoresForCampaignUseCase: ListAuthorizedStoresForCampaignUseCase,
    private readonly getAuthorizationForStoreUseCase: GetAuthorizationForStoreUseCase,
  ) {}

  /**
   * 📌 POST /campaigns/:campaignId/authorizations
   *
   * Intention métier :
   * “Un ADMIN autorise ce magasin à participer à cette campagne”
   *
   * Métier :
   * - si l'autorisation est absente → création ACTIVE
   * - si l'autorisation est INACTIVE → activation
   * - si déjà ACTIVE → idempotent
   */
  @Post()
  async authorize(
    @Param('campaignId', new ParseUUIDPipe()) campaignId: string,
    @Body() dto: ActivateStoreDto,
  ): Promise<void> {
    await this.authorizeStoreForCampaignUseCase.execute({
      campaignId,
      storeId: dto.storeId,
    });
  }

  /**
   * 📌 PATCH /campaigns/:campaignId/authorizations/:storeId/deactivate
   *
   * Intention métier :
   * “Un ADMIN désautorise ce magasin pour cette campagne”
   *
   * Métier :
   * - si l'autorisation n'existe pas → idempotent
   * - si déjà INACTIVE → idempotent
   * - sinon → désactivation
   */
  @Patch(':storeId/deactivate')
  async deactivate(
    @Param('campaignId', new ParseUUIDPipe()) campaignId: string,
    @Param('storeId', new ParseUUIDPipe()) storeId: string,
  ): Promise<void> {
    await this.deactivateStoreForCampaignUseCase.execute({ campaignId, storeId });
  }

  /**
   * 📌 PATCH /campaigns/:campaignId/authorizations/:storeId/activate
    *
    * Même intention que POST mais sans body :
    * “Je réactive explicitement ce magasin”
    *
    * 👉 On réutilise le même use case car le métier est identique :
    * - si absent → création ACTIVE
    * - si INACTIVE → activation
    * - si ACTIVE → idempotent
   */
  @Patch(':storeId/activate')
  async activate(
    @Param('campaignId', new ParseUUIDPipe()) campaignId: string,
    @Param('storeId', new ParseUUIDPipe()) storeId: string,
  ): Promise<void> {
    await this.authorizeStoreForCampaignUseCase.execute({ campaignId, storeId });
  }

  /**
   * 📌 GET /campaigns/:campaignId/authorizations
    *
    * Lecture métier :
    * “Donne-moi la liste des magasins autorisés pour cette campagne.”
    *
    * Détail :
    * - par défaut on renvoie les magasins ACTIVE
    * - `?status=INACTIVE` permet d'afficher l'inverse (utile pour une UI d'administration)
   */
  @Get()
  async list(
    @Param('campaignId', new ParseUUIDPipe()) campaignId: string,
    @Query() query: ListAuthorizationsQueryDto,
  ): Promise<string[]> {
    return this.listAuthorizedStoresForCampaignUseCase.execute({
      campaignId,
      status: query.status,
    });
  }

  /**
   * 📌 GET /campaigns/:campaignId/authorizations/:storeId
    *
    * Lecture métier :
    * “Pour cette campagne, quel est l’état d’autorisation de ce magasin ?”
    *
    * 👉 Utile pour vérifier un cas précis (ou alimenter une UI de détail).
   */
  @Get(':storeId')
  async getOne(
    @Param('campaignId', new ParseUUIDPipe()) campaignId: string,
    @Param('storeId', new ParseUUIDPipe()) storeId: string,
  ): Promise<{ campaignId: string; storeId: string; status: string }> {
    return this.getAuthorizationForStoreUseCase.execute({ campaignId, storeId });
  }
}
