// src/domain/center/center.repository.ts

import { Center } from './center.entity';

/**
 * Interface du repository Center (Domain)
 * Définit le contrat sans implémentation technique
 */
export interface CenterRepository {
  /**
   * Trouve un centre par nom et ville
   */
  findByNameAndCity(name: string, city: string): Promise<Center | null>;

  /**
   * Trouve un centre par ID
   */
  findById(id: string): Promise<Center | null>;

  /**
   * Récupère tous les centres
   */
  findAll(): Promise<Center[]>;

  /**
   * Sauvegarde un centre (create ou update)
   */
  save(center: Center): Promise<void>;

  /**
   * Supprime un centre par ID
   */
  delete(id: string): Promise<void>;
}