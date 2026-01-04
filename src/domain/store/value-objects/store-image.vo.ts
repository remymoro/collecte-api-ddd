// src/domain/store/value-objects/store-image.vo.ts

/**
 * Value Object : Image d'un Store
 *
 * Représente une référence immuable à une image stockée sur Azure Blob Storage
 *
 * ❌ Pas de fichier, blob, buffer
 * ❌ Pas de logique d'upload
 * ✅ Uniquement une URL HTTPS valide
 */
export class StoreImage {
  private constructor(
    readonly url: string,
    readonly isPrimary: boolean,
  ) {}

  /**
   * Factory : créer une image Store
   *
   * Règles métier :
   * - URL obligatoire et valide
   * - HTTPS uniquement (sécurité)
   * - Domaine Azure autorisé
   */
  static create(url: string, isPrimary: boolean = false): StoreImage {
    if (!url || !url.trim()) {
      throw new Error('IMAGE_URL_REQUIRED');
    }

    if (!this.isValidUrl(url)) {
      throw new Error('INVALID_IMAGE_URL');
    }

    return new StoreImage(url.trim(), isPrimary);
  }

  /**
   * Validation : URL sécurisée
   *
   * - HTTPS obligatoire
   * - Format URL valide
   * - Optionnel : whitelist du domaine Azure
   */
  private static isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);

      // Sécurité : HTTPS uniquement
      if (parsed.protocol !== 'https:') {
        return false;
      }

      // Optionnel : restreindre au domaine Azure
      // Décommenter pour activer la whitelist stricte
      // const azurePattern = /^https:\/\/[a-z0-9]+\.blob\.core\.windows\.net\//;
      // return azurePattern.test(url);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Règle métier : promouvoir en image primaire
   */
  setAsPrimary(): StoreImage {
    return new StoreImage(this.url, true);
  }

  /**
   * Règle métier : retirer le statut primaire
   */
  unsetAsPrimary(): StoreImage {
    return new StoreImage(this.url, false);
  }

  /**
   * Égalité par URL
   */
  equals(other: StoreImage): boolean {
    return this.url === other.url;
  }
}
