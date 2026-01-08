import { CollecteEntry } from '@domain/collecte/collecte-entry.entity';
import { EntryStatus } from '@domain/collecte/enums/entry-status.enum';
import { EmptyEntryError } from '@domain/collecte/errors/empty-entry.error';
import { EntryAlreadyValidatedError } from '@domain/collecte/errors/entry-already-validated.error';

const CONTEXT = {
  campaignId: 'campaign-1',
  storeId: 'store-1',
  centerId: 'center-1',
  userId: 'user-1',
} as const;

describe('CollecteEntry (Saisie)', () => {
  it('démarre EN_COURS et sans items', () => {
    const entry = CollecteEntry.create(CONTEXT);

    expect(entry.entryStatus).toBe(EntryStatus.EN_COURS);
    expect(entry.entryItems).toHaveLength(0);
    expect(entry.totalWeightKg).toBe(0);
    expect(entry.entryValidatedAt).toBeUndefined();
  });

  it('ajouter un item arrondit son poids au kg supérieur', () => {
    const entry = CollecteEntry.create(CONTEXT);

    entry.addItem({
      productRef: 'P1',
      family: 'F1',
      weightKg: 5.1,
    });

    expect(entry.entryItems[0].weightKg).toBe(6);
  });

  it('le poids total est la somme des poids arrondis', () => {
    const entry = CollecteEntry.create(CONTEXT);

    entry.addItem({
      productRef: 'P1',
      family: 'F1',
      weightKg: 5.3,
    });
    entry.addItem({
      productRef: 'P2',
      family: 'F2',
      weightKg: 2.1,
    });

    expect(entry.totalWeightKg).toBe(9);
  });

  it('refuse la validation si la saisie est vide', () => {
    const entry = CollecteEntry.create(CONTEXT);

    expect(() => entry.validate()).toThrow(EmptyEntryError);
  });

  it('valider une saisie renseigne la date de validation', () => {
    const entry = CollecteEntry.create(CONTEXT);

    entry.addItem({
      productRef: 'P1',
      family: 'F1',
      weightKg: 10,
    });
    entry.validate();

    expect(entry.entryStatus).toBe(EntryStatus.VALIDEE);
    expect(entry.entryValidatedAt).toBeInstanceOf(Date);
  });

  it('ajouter un item après validation est interdit', () => {
    const entry = CollecteEntry.create(CONTEXT);

    entry.addItem({
      productRef: 'PROD_1',
      family: 'Famille 1',
      weightKg: 10,
    });
    entry.validate();

    expect(() =>
      entry.addItem({ productRef: 'P2', family: 'F2', weightKg: 5 }),
    ).toThrow(EntryAlreadyValidatedError);
  });

  it('supprimer un item après validation est interdit', () => {
    const entry = CollecteEntry.create(CONTEXT);

    entry.addItem({ productRef: 'P1', family: 'F1', weightKg: 10 });
    entry.validate();

    expect(() => entry.removeItem(0)).toThrow(EntryAlreadyValidatedError);
  });
});
