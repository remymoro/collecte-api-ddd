// src/application/campaign-store-authorization/views/store-authorization.view.ts

export type StoreAuthorizationView = {
  storeId: string;
  storeName: string;
  address: string;
  /**
   * Statut enrichi pour l'IHM :
   * - ACTIVE   : autorisé
   * - INACTIVE : autorisation existante mais désactivée
   * - NONE     : aucune autorisation n'a jamais existé
   */
  authorizationStatus: 'ACTIVE' | 'INACTIVE' | 'NONE';
};
