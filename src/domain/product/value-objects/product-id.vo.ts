// src/domain/product/value-objects/product-id.vo.ts

import { randomUUID } from 'crypto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Value Object : ProductId
 *
 * Encapsule l'identifiant unique d'un Product
 * - Type-safety : impossible de passer un StoreId où on attend un ProductId
 * - Validation : garantit que l'ID est un UUID v4 valide
 */
export class ProductId {
  private constructor(private readonly value: string) {
    if (!isValidUuid(value)) {
      throw new Error(`Invalid ProductId: ${value} is not a valid UUID`);
    }
  }

  /**
   * Génère un nouveau ProductId (UUID v4)
   */
  static generate(): ProductId {
    return new ProductId(randomUUID());
  }

  /**
   * Reconstruit un ProductId depuis une string (ex: depuis la BDD)
   * @throws Error si l'ID n'est pas un UUID valide
   */
  static from(id: string): ProductId {
    return new ProductId(id);
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
  equals(other: ProductId): boolean {
    return this.value === other.value;
  }
}
