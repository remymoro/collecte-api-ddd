// src/domain/collecte/value-objects/collecte-entry-id.vo.ts

import { randomUUID } from 'crypto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Value Object : CollecteEntryId
 *
 * Encapsule l'identifiant unique d'une CollecteEntry
 * - Type-safety : impossible de passer un StoreId où on attend un CollecteEntryId
 * - Validation : garantit que l'ID est un UUID v4 valide
 */
export class CollecteEntryId {
  private constructor(private readonly value: string) {
    if (!isValidUuid(value)) {
      throw new Error(`Invalid CollecteEntryId: ${value} is not a valid UUID`);
    }
  }

  /**
   * Génère un nouveau CollecteEntryId (UUID v4)
   */
  static generate(): CollecteEntryId {
    return new CollecteEntryId(randomUUID());
  }

  /**
   * Reconstruit un CollecteEntryId depuis une string (ex: depuis la BDD)
   * @throws Error si l'ID n'est pas un UUID valide
   */
  static from(id: string): CollecteEntryId {
    return new CollecteEntryId(id);
  }

  /**
   * Retourne la représentation string (pour la persistence)
   */
  toString(): string {
    return this.value;
  }

  /**
   * Comparaison d'égalité
   */
  equals(other: CollecteEntryId): boolean {
    return this.value === other.value;
  }
}
