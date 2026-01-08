import { Store } from './store.entity';
import { StoreStatus } from './enums/store-status.enum';
import { CannotModifyClosedStoreError } from './errors/cannot-modify-closed-store.error';
import { StoreAlreadyClosedError } from './errors/store-already-closed.error';
import { StoreImageNotFoundError } from './errors/store-image-not-found.error';

describe('Store Entity', () => {
  // ============================
  // CRÉATION
  // ============================

  describe('create', () => {
    it('should create a store with DISPONIBLE status by default', () => {
      // POURQUOI : Un magasin nouvellement créé doit être disponible pour les collectes
      // RÈGLE MÉTIER : Nouveau magasin = disponible par défaut
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
        '0140001234',
        'Jean Dupont',
      );

      expect(store.status).toBe(StoreStatus.DISPONIBLE);
      expect(store.isAvailableForCollection()).toBe(true);
      expect(store.isClosed()).toBe(false);
    });

    it('should create a store with no images', () => {
      // POURQUOI : Les images ne sont pas obligatoires à la création
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
      );

      expect(store.images).toHaveLength(0);
      expect(store.primaryImage).toBeUndefined();
    });
  });

  // ============================
  // GESTION DES STATUTS
  // ============================

  describe('Status transitions', () => {
    it('should mark store as unavailable with reason', () => {
      // POURQUOI : Un magasin peut devenir temporairement indisponible (travaux, fermeture exceptionnelle)
      // RÈGLE MÉTIER : Indisponibilité nécessite une raison et un auteur pour traçabilité
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
      );

      store.markAsUnavailable('user-456', 'Travaux en cours');

      expect(store.status).toBe(StoreStatus.INDISPONIBLE);
      expect(store.statusReason).toBe('Travaux en cours');
      expect(store.statusChangedBy).toBe('user-456');
      expect(store.isAvailableForCollection()).toBe(false);
    });

    it('should mark unavailable store back as available', () => {
      // POURQUOI : Un magasin indisponible peut redevenir disponible
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
      );

      store.markAsUnavailable('user-456', 'Travaux en cours');
      store.markAsAvailable('user-456');

      expect(store.status).toBe(StoreStatus.DISPONIBLE);
      expect(store.statusReason).toBeUndefined();
      expect(store.isAvailableForCollection()).toBe(true);
    });

    it('should close store with reason', () => {
      // POURQUOI : Un magasin fermé définitivement ne doit plus apparaître dans les collectes
      // RÈGLE MÉTIER : Fermeture = état final, nécessite raison pour historique
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
      );

      store.close('user-456', 'Magasin fermé définitivement');

      expect(store.status).toBe(StoreStatus.FERME);
      expect(store.statusReason).toBe('Magasin fermé définitivement');
      expect(store.isClosed()).toBe(true);
      expect(store.isAvailableForCollection()).toBe(false);
    });

    it('should prevent closing an already closed store', () => {
      // POURQUOI : Éviter les doublons de fermeture et préserver la date/raison originale
      // RÈGLE MÉTIER : Un magasin fermé ne peut pas être refermé
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
      );

      store.close('user-456', 'Magasin fermé définitivement');

      expect(() => store.close('user-789', 'Autre raison')).toThrow(
        StoreAlreadyClosedError,
      );
    });

    it('should prevent marking closed store as unavailable', () => {
      // POURQUOI : Un magasin fermé ne peut pas changer d'état (état final)
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
      );

      store.close('user-456', 'Magasin fermé définitivement');

      expect(() =>
        store.markAsUnavailable('user-789', 'Travaux'),
      ).toThrow(StoreAlreadyClosedError);
    });

    it('should prevent marking closed store as available', () => {
      // POURQUOI : Un magasin fermé ne peut pas rouvrir (état final)
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
      );

      store.close('user-456', 'Magasin fermé définitivement');

      expect(() => store.markAsAvailable('user-789')).toThrow(
        StoreAlreadyClosedError,
      );
    });
  });

  // ============================
  // GESTION DES INFORMATIONS
  // ============================

  describe('updateInfo', () => {
    it('should update store information when not closed', () => {
      // POURQUOI : Les informations d'un magasin actif peuvent être mises à jour
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
      );

      store.updateInfo(
        'Carrefour Express',
        '20 rue de la République',
        'Lyon',
        '69001',
        '0478001234',
        'Marie Martin',
      );

      expect(store.name).toBe('Carrefour Express');
      expect(store.address).toBe('20 rue de la République');
      expect(store.city).toBe('Lyon');
      expect(store.postalCode).toBe('69001');
    });

    it('should prevent updating information of closed store', () => {
      // POURQUOI : Un magasin fermé ne doit plus être modifiable (données figées pour historique)
      // RÈGLE MÉTIER : Magasin fermé = lecture seule
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
      );

      store.close('user-456', 'Magasin fermé définitivement');

      expect(() =>
        store.updateInfo(
          'Nouveau nom',
          'Nouvelle adresse',
          'Paris',
          '75001',
        ),
      ).toThrow(CannotModifyClosedStoreError);
    });
  });

  // ============================
  // GESTION DES IMAGES
  // ============================

  describe('Image management', () => {
    it('should add image to store', () => {
      // POURQUOI : Les images aident les bénévoles à identifier le magasin
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
      );

      store.addImage('https://example.com/image1.jpg');

      expect(store.images).toHaveLength(1);
      expect(store.images[0].url).toBe('https://example.com/image1.jpg');
    });

    it('should add image as primary and demote other primary', () => {
      // POURQUOI : Une seule image principale par magasin pour l'affichage prioritaire
      // RÈGLE MÉTIER : Ajout d'une image primaire = les autres perdent le statut primaire
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
      );

      store.addImage('https://example.com/image1.jpg', true);
      store.addImage('https://example.com/image2.jpg', true);

      expect(store.images).toHaveLength(2);
      expect(store.images[0].isPrimary).toBe(false);
      expect(store.images[1].isPrimary).toBe(true);
      expect(store.primaryImage?.url).toBe('https://example.com/image2.jpg');
    });

    it('should set primary image among existing images', () => {
      // POURQUOI : Permet de changer l'image principale sans supprimer/recréer
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
      );

      store.addImage('https://example.com/image1.jpg');
      store.addImage('https://example.com/image2.jpg');
      store.setPrimaryImage('https://example.com/image1.jpg');

      expect(store.images[0].isPrimary).toBe(true);
      expect(store.images[1].isPrimary).toBe(false);
      expect(store.primaryImage?.url).toBe('https://example.com/image1.jpg');
    });

    it('should throw error when setting non-existent image as primary', () => {
      // POURQUOI : Éviter les références à des images inexistantes
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
      );

      store.addImage('https://example.com/image1.jpg');

      expect(() =>
        store.setPrimaryImage('https://example.com/non-existent.jpg'),
      ).toThrow(StoreImageNotFoundError);
    });

    it('should remove image from store', () => {
      // POURQUOI : Permet de supprimer des images obsolètes ou incorrectes
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
      );

      store.addImage('https://example.com/image1.jpg');
      store.addImage('https://example.com/image2.jpg');
      store.removeImage('https://example.com/image1.jpg');

      expect(store.images).toHaveLength(1);
      expect(store.images[0].url).toBe('https://example.com/image2.jpg');
    });

    it('should throw error when removing non-existent image', () => {
      // POURQUOI : Éviter les suppressions silencieuses d'images inexistantes
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
      );

      expect(() =>
        store.removeImage('https://example.com/non-existent.jpg'),
      ).toThrow(StoreImageNotFoundError);
    });

    it('should return defensive copy of images', () => {
      // POURQUOI : Préserver l'encapsulation - les images ne doivent pas être modifiables de l'extérieur
      const store = Store.create(
        'center-123',
        'Carrefour City',
        '10 rue de la Paix',
        'Paris',
        '75001',
      );

      store.addImage('https://example.com/image1.jpg');
      const images = store.images;
      images.pop();

      expect(store.images).toHaveLength(1);
    });
  });
});
