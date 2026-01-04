// src/domain/campaign-store-authorization/campaign-store-authorization.repository.ts

import type { CampaignStoreAuthorization } from './campaign-store-authorization.entity';
import type { CampaignStoreAuthorizationStatus } from './campaign-store-authorization.entity';

export abstract class CampaignStoreAuthorizationRepository {
  /**
   * Sauvegarde une autorisation (création si absente, mise à jour sinon)
   */
  abstract save(authorization: CampaignStoreAuthorization): Promise<void>;

  /**
   * Récupère l'autorisation d'un magasin pour une campagne
   */
  abstract findByCampaignAndStore(
    campaignId: string,
    storeId: string,
  ): Promise<CampaignStoreAuthorization | null>;

  /**
   * Liste les magasins autorisés pour une campagne, filtrable par status
   */
  abstract findStoreIdsByCampaign(
    campaignId: string,
    status?: CampaignStoreAuthorizationStatus,
  ): Promise<string[]>;

  /**
   * Lecture "projection UI": récupérer en masse les autorisations
   * d'une campagne pour un ensemble de magasins.
   *
   * Permet de distinguer :
   * - INACTIVE (autorisation existante mais désactivée)
   * - NONE (aucune autorisation n'a jamais existé)
   */
  abstract findByCampaignAndStoreIds(
    campaignId: string,
    storeIds: string[],
  ): Promise<CampaignStoreAuthorization[]>;
}
