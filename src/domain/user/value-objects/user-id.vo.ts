// src/domain/user/value-objects/user-id.vo.ts

import { randomUUID } from 'crypto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Value Object : UserId
 *
 * Encapsule l'identifiant unique d'un User
 * - Type-safety : impossible de passer un CenterId où on attend un UserId
 * - Validation : garantit que l'ID est un UUID v4 valide
 */
export class UserId {
  private constructor(private readonly value: string) {
    if (!isValidUuid(value)) {
      throw new Error(`Invalid UserId: ${value} is not a valid UUID`);
    }
  }

  /**
   * Génère un nouveau UserId (UUID v4)
   */
  static generate(): UserId {
    return new UserId(randomUUID());
  }

  /**
   * Reconstruit un UserId depuis une string (ex: depuis la BDD)
   * @throws Error si l'ID n'est pas un UUID valide
   */
  static from(id: string): UserId {
    return new UserId(id);
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
  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
