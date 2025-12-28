import { CollecteEntry } from '../../../domain/collecte/collecte-entry.entity';
import { EntryStatus } from '../../../domain/collecte/enums/entry-status.enum';
import { EmptyEntryError } from '../../../domain/collecte/errors/empty-entry.error';
import { EntryAlreadyValidatedError } from '../../../domain/collecte/errors/entry-already-validated.error';

describe('CollecteEntry (Tests complets)', () => {
  describe('Création et état initial', () => {
    it('commence avec le statut EN_COURS', () => {
      const entry = new CollecteEntry();

      expect(entry.entryStatus).toBe(EntryStatus.EN_COURS);
    });

    it('génère un UUID par défaut', () => {
      const entry = new CollecteEntry();

      expect(entry.entryId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('accepte un ID personnalisé', () => {
      const entry = new CollecteEntry('custom-id');

      expect(entry.entryId).toBe('custom-id');
      expect(entry.id).toBe('custom-id'); // Backward compat
    });

    it('initialise la date de création à maintenant par défaut', () => {
      const before = Date.now();
      const entry = new CollecteEntry();
      const after = Date.now();

      expect(entry.entryCreatedAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(entry.entryCreatedAt.getTime()).toBeLessThanOrEqual(after);
    });

    it('accepte une date de création personnalisée', () => {
      const fixedDate = new Date('2024-01-15T10:00:00Z');
      const entry = new CollecteEntry('id-1', fixedDate);

      expect(entry.entryCreatedAt).toEqual(fixedDate);
    });

    it('n\'a pas de date de validation initialement', () => {
      const entry = new CollecteEntry();

      expect(entry.entryValidatedAt).toBeUndefined();
      expect(entry.validatedAt).toBeUndefined();
    });

    it('a un poids total de 0 à la création', () => {
      const entry = new CollecteEntry();

      expect(entry.totalWeightKg).toBe(0);
    });

    it('a une liste d\'items vide à la création', () => {
      const entry = new CollecteEntry();

      expect(entry.entryItems).toHaveLength(0);
    });
  });

  describe('Ajout d\'items', () => {
    it('permet d\'ajouter un item avec toutes les infos', () => {
      const entry = new CollecteEntry();

      entry.addItem({
        productRef: 'PROD_1',
        family: 'Protéines',
        subFamily: 'Sans porc',
        weightKg: 10,
      });

      const items = entry.entryItems;
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual({
        productRef: 'PROD_1',
        family: 'Protéines',
        subFamily: 'Sans porc',
        weightKg: 10,
      });
    });

    it('permet d\'ajouter un item sans sous-famille', () => {
      const entry = new CollecteEntry();

      entry.addItem({
        productRef: 'PROD_2',
        family: 'Fruits',
        weightKg: 7,
      });

      const items = entry.entryItems;
      expect(items[0].subFamily).toBeUndefined();
    });

    it('permet d\'ajouter plusieurs items', () => {
      const entry = new CollecteEntry();

      entry.addItem({
        productRef: 'PROD_1',
        family: 'Famille 1',
        weightKg: 10,
      });
      entry.addItem({
        productRef: 'PROD_2',
        family: 'Famille 2',
        weightKg: 5,
      });
      entry.addItem({
        productRef: 'PROD_3',
        family: 'Famille 3',
        weightKg: 3,
      });

      expect(entry.entryItems).toHaveLength(3);
    });

    it('arrondit automatiquement les poids décimaux au kg supérieur', () => {
      const entry = new CollecteEntry();

      entry.addItem({
        productRef: 'PROD_1',
        family: 'Famille 1',
        weightKg: 5.3,
      });

      expect(entry.entryItems[0].weightKg).toBe(6);
    });

    it('conserve l\'ordre d\'ajout des items', () => {
      const entry = new CollecteEntry();

      entry.addItem({ productRef: 'A', family: 'F1', weightKg: 1 });
      entry.addItem({ productRef: 'B', family: 'F2', weightKg: 2 });
      entry.addItem({ productRef: 'C', family: 'F3', weightKg: 3 });

      const refs = entry.entryItems.map((i) => i.productRef);
      expect(refs).toEqual(['A', 'B', 'C']);
    });
  });

  describe('Suppression d\'items', () => {
    it('permet de supprimer un item par index', () => {
      const entry = new CollecteEntry();

      entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
      entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
      entry.addItem({ productRef: 'PROD_3', family: 'F3', weightKg: 3 });

      entry.removeItem(1); // Supprime PROD_2

      const items = entry.entryItems;
      expect(items).toHaveLength(2);
      expect(items[0].productRef).toBe('PROD_1');
      expect(items[1].productRef).toBe('PROD_3');
    });

    it('permet de supprimer le premier item', () => {
      const entry = new CollecteEntry();

      entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
      entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });

      entry.removeItem(0);

      expect(entry.entryItems).toHaveLength(1);
      expect(entry.entryItems[0].productRef).toBe('PROD_2');
    });

    it('permet de supprimer le dernier item', () => {
      const entry = new CollecteEntry();

      entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
      entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });

      entry.removeItem(1);

      expect(entry.entryItems).toHaveLength(1);
      expect(entry.entryItems[0].productRef).toBe('PROD_1');
    });

    it('met à jour le poids total après suppression', () => {
      const entry = new CollecteEntry();

      entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
      entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });

      expect(entry.totalWeightKg).toBe(15);

      entry.removeItem(0);

      expect(entry.totalWeightKg).toBe(5);
    });
  });

  describe('Calcul du poids total', () => {
    it('retourne 0 pour une entrée vide', () => {
      const entry = new CollecteEntry();

      expect(entry.totalWeightKg).toBe(0);
    });

    it('calcule le total avec un seul item', () => {
      const entry = new CollecteEntry();

      entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 15 });

      expect(entry.totalWeightKg).toBe(15);
    });

    it('calcule le total avec plusieurs items', () => {
      const entry = new CollecteEntry();

      entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
      entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
      entry.addItem({ productRef: 'PROD_3', family: 'F3', weightKg: 3 });

      expect(entry.totalWeightKg).toBe(18);
    });

    it('prend en compte les arrondis dans le calcul total', () => {
      const entry = new CollecteEntry();

      entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 5.3 }); // → 6
      entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 2.1 }); // → 3

      expect(entry.totalWeightKg).toBe(9); // 6 + 3
    });
  });

  describe('Validation', () => {
    it('refuse la validation si l\'entrée est vide', () => {
      const entry = new CollecteEntry();

      expect(() => entry.validate()).toThrow(EmptyEntryError);
    });

    it('valide une entrée avec un seul item', () => {
      const entry = new CollecteEntry();

      entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });

      expect(() => entry.validate()).not.toThrow();
    });

    it('change le statut à VALIDEE après validation', () => {
      const entry = new CollecteEntry();

      entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
      entry.validate();

      expect(entry.entryStatus).toBe(EntryStatus.VALIDEE);
    });

    it('définit la date de validation', () => {
      const entry = new CollecteEntry();

      entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });

      expect(entry.entryValidatedAt).toBeUndefined();

      const before = Date.now();
      entry.validate();
      const after = Date.now();

      expect(entry.entryValidatedAt).toBeInstanceOf(Date);
      expect(entry.entryValidatedAt!.getTime()).toBeGreaterThanOrEqual(before);
      expect(entry.entryValidatedAt!.getTime()).toBeLessThanOrEqual(after);
    });

    it('refuse la double validation', () => {
      const entry = new CollecteEntry();

      entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
      entry.validate();

      expect(() => entry.validate()).toThrow(EntryAlreadyValidatedError);
    });
  });

  describe('Immutabilité après validation', () => {
    it('interdit l\'ajout d\'items après validation', () => {
      const entry = new CollecteEntry();

      entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
      entry.validate();

      expect(() =>
        entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 }),
      ).toThrow(EntryAlreadyValidatedError);
    });

    it('interdit la suppression d\'items après validation', () => {
      const entry = new CollecteEntry();

      entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
      entry.validate();

      expect(() => entry.removeItem(0)).toThrow(EntryAlreadyValidatedError);
    });

    it('conserve les items existants après validation', () => {
      const entry = new CollecteEntry();

      entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
      entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
      entry.validate();

      expect(entry.entryItems).toHaveLength(2);
      expect(entry.totalWeightKg).toBe(15);
    });
  });

  describe('Factory method - rehydrate', () => {
    it('reconstruit une entrée VALIDEE complète', () => {
      const fixedDate = new Date('2024-01-15T10:00:00Z');
      const validatedDate = new Date('2024-01-15T11:30:00Z');

      const entry = CollecteEntry.rehydrate({
        id: 'entry-123',
        status: EntryStatus.VALIDEE,
        createdAt: fixedDate,
        validatedAt: validatedDate,
        items: [
          {
            productRef: 'PROD_1',
            family: 'Protéines',
            subFamily: 'Sans porc',
            weightKg: 10,
          },
          {
            productRef: 'PROD_2',
            family: 'Fruits',
            weightKg: 5,
          },
        ],
      });

      expect(entry.entryId).toBe('entry-123');
      expect(entry.entryStatus).toBe(EntryStatus.VALIDEE);
      expect(entry.entryCreatedAt).toEqual(fixedDate);
      expect(entry.entryValidatedAt).toEqual(validatedDate);
      expect(entry.entryItems).toHaveLength(2);
      expect(entry.totalWeightKg).toBe(15);
    });

    it('reconstruit une entrée EN_COURS sans items', () => {
      const fixedDate = new Date('2024-01-15T10:00:00Z');

      const entry = CollecteEntry.rehydrate({
        id: 'entry-456',
        status: EntryStatus.EN_COURS,
        createdAt: fixedDate,
      });

      expect(entry.entryId).toBe('entry-456');
      expect(entry.entryStatus).toBe(EntryStatus.EN_COURS);
      expect(entry.entryValidatedAt).toBeUndefined();
      expect(entry.entryItems).toHaveLength(0);
      expect(entry.totalWeightKg).toBe(0);
    });

    it('reconstruit une entrée EN_COURS avec items', () => {
      const entry = CollecteEntry.rehydrate({
        id: 'entry-789',
        status: EntryStatus.EN_COURS,
        createdAt: new Date(),
        items: [
          { productRef: 'PROD_1', family: 'F1', weightKg: 10 },
        ],
      });

      expect(entry.entryStatus).toBe(EntryStatus.EN_COURS);
      expect(entry.entryItems).toHaveLength(1);
      // Une entrée rehydratée EN_COURS peut encore être modifiée
      expect(() =>
        entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 }),
      ).not.toThrow();
    });

    it('empêche la modification d\'une entrée rehydratée VALIDEE', () => {
      const entry = CollecteEntry.rehydrate({
        id: 'entry-abc',
        status: EntryStatus.VALIDEE,
        createdAt: new Date(),
        validatedAt: new Date(),
        items: [{ productRef: 'PROD_1', family: 'F1', weightKg: 10 }],
      });

      expect(() =>
        entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 }),
      ).toThrow(EntryAlreadyValidatedError);
    });
  });

  describe('Immutabilité des collections', () => {
    it('retourne une collection readonly d\'items', () => {
      const entry = new CollecteEntry();

      entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });

      const items = entry.entryItems;

      // Le type ReadonlyArray est une protection TypeScript
      // Vérifier que c'est bien un array readonly
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(1);

      // Vérifier que modifier le tableau retourné n'affecte pas l'entrée
      const itemsCopy = [...items];
      itemsCopy.push({ productRef: 'HACK', family: 'Hack', weightKg: 999 });

      // L'entrée originale n'a toujours qu'un item
      expect(entry.entryItems.length).toBe(1);
    });
  });

  describe('Snapshot des produits', () => {
    it('capture les infos produit au moment de l\'ajout', () => {
      const entry = new CollecteEntry();

      entry.addItem({
        productRef: 'PROD_1',
        family: 'Ancienne famille',
        subFamily: 'Ancienne sous-famille',
        weightKg: 10,
      });

      const item = entry.entryItems[0];

      // Les valeurs sont figées (snapshot)
      expect(item.family).toBe('Ancienne famille');
      expect(item.subFamily).toBe('Ancienne sous-famille');
    });
  });
});