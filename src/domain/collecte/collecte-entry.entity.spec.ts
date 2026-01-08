// src/domain/collecte/collecte-entry.entity.spec.ts

import { CollecteEntry, CollecteEntryContext } from './collecte-entry.entity';
import { EntryStatus } from './enums/entry-status.enum';
import { EmptyEntryError } from './errors/empty-entry.error';
import { EntryAlreadyValidatedError } from './errors/entry-already-validated.error';
import { CampaignId } from '@domain/campaign/value-objects/campaign-id.vo';
import { StoreId } from '@domain/store/value-objects/store-id.vo';
import { CenterId } from '@domain/center/value-objects/center-id.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';

describe('CollecteEntry Entity', () => {
  function createTestContext(): CollecteEntryContext {
    return {
      campaignId: CampaignId.generate(),
      storeId: StoreId.generate(),
      centerId: CenterId.generate(),
      userId: UserId.generate(),
    };
  }

  describe('Règle métier : Impossible de valider une entry vide', () => {
    it('refuse la validation d une entry sans items', () => {
      // POURQUOI : Une collecte vide n'a aucune valeur métier
      const entry = CollecteEntry.create(createTestContext());

      expect(() => entry.validate()).toThrow(EmptyEntryError);
    });

    it('accepte la validation d une entry avec au moins 1 item', () => {
      // POURQUOI : Une collecte avec des produits est valide
      const entry = CollecteEntry.create(createTestContext());

      entry.addItem({
        productRef: 'PROD-001',
        family: 'Alimentaire',
        subFamily: 'Conserves',
        weightKg: 10,
      });

      entry.validate();

      expect(entry.status).toBe(EntryStatus.VALIDEE);
      expect(entry.validatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Règle métier : Entry validée = IMMUTABLE', () => {
    it('refuse d ajouter un item après validation', () => {
      // POURQUOI : Une entry validée ne peut plus être modifiée (intégrité)
      const entry = CollecteEntry.create(createTestContext());

      entry.addItem({
        productRef: 'PROD-001',
        family: 'Alimentaire',
        weightKg: 10,
      });

      entry.validate();

      expect(() =>
        entry.addItem({
          productRef: 'PROD-002',
          family: 'Textile',
          weightKg: 5,
        }),
      ).toThrow(EntryAlreadyValidatedError);
    });

    it('refuse de supprimer un item après validation', () => {
      // POURQUOI : Protection contre la modification des données consolidées
      const entry = CollecteEntry.create(createTestContext());

      entry.addItem({
        productRef: 'PROD-001',
        family: 'Alimentaire',
        weightKg: 10,
      });

      entry.validate();

      expect(() => entry.removeItem(0)).toThrow(EntryAlreadyValidatedError);
    });

    it('refuse une double validation', () => {
      // POURQUOI : La validation est un événement unique
      const entry = CollecteEntry.create(createTestContext());

      entry.addItem({
        productRef: 'PROD-001',
        family: 'Alimentaire',
        weightKg: 10,
      });

      entry.validate();

      expect(() => entry.validate()).toThrow(EntryAlreadyValidatedError);
    });
  });

  describe('Règle métier : Calcul du poids total', () => {
    it('retourne 0 pour une entry vide', () => {
      // POURQUOI : Zéro produit = zéro poids
      const entry = CollecteEntry.create(createTestContext());
      expect(entry.totalWeightKg).toBe(0);
    });

    it('somme correctement les poids des items', () => {
      // POURQUOI : Le poids total est critique pour les rapports
      const entry = CollecteEntry.create(createTestContext());

      entry.addItem({
        productRef: 'PROD-001',
        family: 'Alimentaire',
        weightKg: 10,
      });

      entry.addItem({
        productRef: 'PROD-002',
        family: 'Textile',
        weightKg: 5.7, // arrondi à 6
      });

      // 10 + 6 (arrondi) = 16
      expect(entry.totalWeightKg).toBe(16);
    });
  });

  describe('Règle métier : Suppression d items', () => {
    it('supprime un item par son index', () => {
      // POURQUOI : Correction d'erreur de saisie
      const entry = CollecteEntry.create(createTestContext());

      entry.addItem({
        productRef: 'PROD-001',
        family: 'Alimentaire',
        weightKg: 10,
      });

      entry.addItem({
        productRef: 'PROD-002',
        family: 'Textile',
        weightKg: 5,
      });

      expect(entry.itemsSnapshot).toHaveLength(2);

      entry.removeItem(0); // Supprime le premier

      expect(entry.itemsSnapshot).toHaveLength(1);
      expect(entry.itemsSnapshot[0].productRef).toBe('PROD-002');
    });
  });
});
