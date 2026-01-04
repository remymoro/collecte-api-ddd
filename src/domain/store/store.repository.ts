// src/domain/store/store.repository.ts

import type { Store } from './store.entity';
import type { StoreStatus } from './enums/store-status.enum';

/**
 * Filtres pour la recherche de Stores
 */
export interface StoreFilters {
  centerId?: string;
  city?: string;
  status?: StoreStatus;
  statusIn?: StoreStatus[];
}

/**
 * Repository Store (Port)
 *
 * Définit le contrat sans implémentation technique
 */
export abstract class StoreRepository {
  /**
   * Sauvegarde un Store (create ou update)
   */
  abstract save(store: Store): Promise<void>;

  /**
   * Trouve un Store par ID
   * @throws StoreNotFoundError si non trouvé
   */
  abstract findById(id: string): Promise<Store>;

  /**
   * Récupère tous les Stores avec filtres optionnels
   */
  abstract findAll(filters?: StoreFilters): Promise<Store[]>;

  /**
   * Vérifie si un Store existe déjà à cette adresse pour ce Center
   *
   * Règle métier : l'identité d'un Store = centerId + address
   * (pas le nom, car on peut avoir plusieurs Lidl dans un même centre)
   */
  abstract findByCenterIdAndAddress(
    centerId: string,
    address: string,
    city: string,
    postalCode: string,
  ): Promise<Store | null>;




  abstract findAvailableForCampaignAndCenter(
    campaignId: string,
    centerId: string,
  ): Promise<Store[]>;
}

