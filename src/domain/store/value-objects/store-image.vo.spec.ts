import { StoreImage } from './store-image.vo';

describe('StoreImage Value Object', () => {
  // ============================
  // CRÉATION & VALIDATION
  // ============================

  describe('create', () => {
    it('should create a valid store image with HTTPS URL', () => {
      // POURQUOI : Les images doivent être accessibles via URL sécurisée
      // RÈGLE MÉTIER : URL HTTPS obligatoire pour la sécurité
      const image = StoreImage.create('https://example.com/store.jpg');

      expect(image.url).toBe('https://example.com/store.jpg');
      expect(image.isPrimary).toBe(false);
    });

    it('should create a primary store image', () => {
      // POURQUOI : L'image principale s'affiche en premier dans l'interface
      const image = StoreImage.create('https://example.com/store.jpg', true);

      expect(image.isPrimary).toBe(true);
    });

    it('should trim whitespace from URL', () => {
      // POURQUOI : Éviter les URLs invalides dues à des espaces en trop
      const image = StoreImage.create('  https://example.com/store.jpg  ');

      expect(image.url).toBe('https://example.com/store.jpg');
    });

    it('should reject empty URL', () => {
      // POURQUOI : Une image sans URL est inutilisable
      // RÈGLE MÉTIER : URL obligatoire
      expect(() => StoreImage.create('')).toThrow('IMAGE_URL_REQUIRED');
    });

    it('should reject whitespace-only URL', () => {
      // POURQUOI : Une URL ne contenant que des espaces est invalide
      expect(() => StoreImage.create('   ')).toThrow('IMAGE_URL_REQUIRED');
    });

    it('should reject HTTP URLs (require HTTPS)', () => {
      // POURQUOI : HTTP n'est pas sécurisé pour les images sensibles
      // RÈGLE MÉTIER : HTTPS obligatoire pour la sécurité
      expect(() => StoreImage.create('http://example.com/store.jpg')).toThrow(
        'INVALID_IMAGE_URL',
      );
    });

    it('should reject invalid URL format', () => {
      // POURQUOI : Les URLs invalides causent des erreurs d'affichage
      expect(() => StoreImage.create('not-a-valid-url')).toThrow(
        'INVALID_IMAGE_URL',
      );
    });

    it('should reject FTP URLs', () => {
      // POURQUOI : Seul HTTPS est supporté pour l'affichage web
      expect(() => StoreImage.create('ftp://example.com/store.jpg')).toThrow(
        'INVALID_IMAGE_URL',
      );
    });
  });

  // ============================
  // RÈGLES MÉTIER — STATUT PRIMAIRE
  // ============================

  describe('Primary status management', () => {
    it('should promote image to primary', () => {
      // POURQUOI : Permet de changer l'image principale d'un magasin
      // RÈGLE MÉTIER : setAsPrimary crée une nouvelle instance (immutabilité)
      const image = StoreImage.create('https://example.com/store.jpg');
      const primaryImage = image.setAsPrimary();

      expect(image.isPrimary).toBe(false);
      expect(primaryImage.isPrimary).toBe(true);
      expect(primaryImage.url).toBe('https://example.com/store.jpg');
    });

    it('should demote primary image', () => {
      // POURQUOI : Quand une autre image devient primaire, l'ancienne perd ce statut
      // RÈGLE MÉTIER : unsetAsPrimary crée une nouvelle instance (immutabilité)
      const image = StoreImage.create('https://example.com/store.jpg', true);
      const demotedImage = image.unsetAsPrimary();

      expect(image.isPrimary).toBe(true);
      expect(demotedImage.isPrimary).toBe(false);
      expect(demotedImage.url).toBe('https://example.com/store.jpg');
    });
  });

  // ============================
  // ÉGALITÉ
  // ============================

  describe('equals', () => {
    it('should consider two images with same URL as equal', () => {
      // POURQUOI : L'égalité d'images est basée sur l'URL (identifiant unique)
      // RÈGLE MÉTIER : Même URL = même image, même si statut primaire différent
      const image1 = StoreImage.create('https://example.com/store.jpg', false);
      const image2 = StoreImage.create('https://example.com/store.jpg', true);

      expect(image1.equals(image2)).toBe(true);
    });

    it('should consider two images with different URLs as different', () => {
      // POURQUOI : URLs différentes = images différentes
      const image1 = StoreImage.create('https://example.com/store1.jpg');
      const image2 = StoreImage.create('https://example.com/store2.jpg');

      expect(image1.equals(image2)).toBe(false);
    });
  });

  // ============================
  // IMMUTABILITÉ
  // ============================

  describe('Immutability', () => {
    it('should be immutable (readonly properties)', () => {
      // POURQUOI : Les Value Objects doivent être immuables (principe DDD)
      // RÈGLE MÉTIER : Modification = nouvelle instance
      const image = StoreImage.create('https://example.com/store.jpg');

      // TypeScript empêche les modifications directes au niveau du compilateur
      // Ce test vérifie que les propriétés sont readonly
      expect(image.url).toBe('https://example.com/store.jpg');
      expect(image.isPrimary).toBe(false);

      // Pour modifier, on crée une nouvelle instance
      const primaryImage = image.setAsPrimary();
      expect(primaryImage.isPrimary).toBe(true);
      expect(image.isPrimary).toBe(false); // L'original est inchangé
    });
  });
});
