import { CollecteEntry } from '@domain/collecte/collecte-entry.entity';
import { EntryStatus } from '@domain/collecte/enums/entry-status.enum';
import { EmptyEntryError } from '@domain/collecte/errors/empty-entry.error';
import { EntryAlreadyValidatedError } from '@domain/collecte/errors/entry-already-validated.error';

describe('CollecteEntry (Saisie)', () => {
  it('commence avec le statut EN_COURS', () => {
    const entry = new CollecteEntry();

    expect(entry.entryStatus).toBe(EntryStatus.EN_COURS);
  });

  it('permet d’ajouter un produit avec un poids valide', () => {
    const entry = new CollecteEntry();

    entry.addItem({
      productRef: 'PROD_1',
      family: 'Famille 1',
      subFamily: 'SousFamille 1',
      weightKg: 10,
    });

    expect(entry.totalWeightKg).toBe(10);
  });

  it('permet de supprimer un produit tant que la saisie est en cours', () => {
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

    entry.removeItem(0);

    expect(entry.totalWeightKg).toBe(5);
  });

  it('refuse la validation si la saisie est vide', () => {
    const entry = new CollecteEntry();

    expect(() => entry.validate()).toThrow(EmptyEntryError);
  });

  it('devient VALIDEE après validation', () => {
    const entry = new CollecteEntry();

    entry.addItem({
      productRef: 'PROD_1',
      family: 'Famille 1',
      weightKg: 10,
    });
    entry.validate();

    expect(entry.entryStatus).toBe(EntryStatus.VALIDEE);
  });

  it('interdit toute modification après validation', () => {
    const entry = new CollecteEntry();

    entry.addItem({
      productRef: 'PROD_1',
      family: 'Famille 1',
      weightKg: 10,
    });
    entry.validate();

    expect(() =>
      entry.addItem({
        productRef: 'PROD_2',
        family: 'Famille 2',
        weightKg: 5,
      }),
    ).toThrow(EntryAlreadyValidatedError);
  });



  
});
