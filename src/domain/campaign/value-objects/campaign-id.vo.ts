import { randomUUID } from 'crypto';

/**
 * Value Object : Identifiant unique d'une Campaign
 *
 * Protège contre la primitive obsession :
 * - Type fort (pas de mélange avec d'autres IDs)
 * - Validation du format UUID
 * - Génération sécurisée
 */
export class CampaignId {
  private constructor(private readonly value: string) {}

  /**
   * Génère un nouvel ID pour création métier
   */
  static generate(): CampaignId {
    return new CampaignId(randomUUID());
  }

  /**
   * Reconstruit un ID existant (depuis DB, URL, etc.)
   */
  static from(id: string): CampaignId {
    if (!id || !id.trim()) {
      throw new Error('CAMPAIGN_ID_REQUIRED');
    }

    // Validation UUID v4
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(id.trim())) {
      throw new Error(`Invalid CampaignId: ${id} is not a valid UUID`);
    }

    return new CampaignId(id.trim());
  }

  /**
   * Retourne la valeur brute (pour persistence, URLs, etc.)
   */
  toString(): string {
    return this.value;
  }

  /**
   * Égalité par valeur
   */
  equals(other: CampaignId): boolean {
    return this.value === other.value;
  }
}
