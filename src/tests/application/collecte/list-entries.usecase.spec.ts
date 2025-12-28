import { ListEntriesUseCase } from '../../../application/collecte/list-entries.usecase';
import { InMemoryCollecteEntryRepository } from '../../../infrastructure/collecte/in-memory-collecte-entry.repository';
import { CollecteEntry } from '@domain/collecte/collecte-entry.entity';
import { EntryStatus } from '@domain/collecte/enums/entry-status.enum';

describe('ListEntriesUseCase', () => {
  let repository: InMemoryCollecteEntryRepository;
  let useCase: ListEntriesUseCase;

  beforeEach(() => {
    repository = new InMemoryCollecteEntryRepository();
    useCase = new ListEntriesUseCase(repository);
  });

  it('retourne une liste vide quand il n\'y a pas d\'entrées', async () => {
    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual([]);
  });

  it('retourne toutes les entrées', async () => {
    // Arrange
    const entry1 = new CollecteEntry();
    entry1.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    await repository.save(entry1);

    const entry2 = new CollecteEntry();
    entry2.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
    await repository.save(entry2);

    const entry3 = new CollecteEntry();
    entry3.addItem({ productRef: 'PROD_3', family: 'F3', weightKg: 3 });
    await repository.save(entry3);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toHaveLength(3);
  });

  it('retourne le totalWeightKg pour chaque entrée', async () => {
    // Arrange
    const entry1 = new CollecteEntry();
    entry1.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    entry1.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
    await repository.save(entry1);

    const entry2 = new CollecteEntry();
    entry2.addItem({ productRef: 'PROD_3', family: 'F3', weightKg: 7 });
    await repository.save(entry2);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result[0].totalWeightKg).toBe(15);
    expect(result[1].totalWeightKg).toBe(7);
  });

  it('retourne le status pour chaque entrée', async () => {
    // Arrange
    const enCours = new CollecteEntry();
    enCours.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    await repository.save(enCours);

    const validee = new CollecteEntry();
    validee.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
    validee.validate();
    await repository.save(validee);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result[0].status).toBe(EntryStatus.EN_COURS);
    expect(result[1].status).toBe(EntryStatus.VALIDEE);
  });

  it('retourne la date de création pour chaque entrée', async () => {
    // Arrange
    const date1 = new Date('2024-01-15T10:00:00Z');
    const date2 = new Date('2024-01-16T14:30:00Z');

    const entry1 = new CollecteEntry('entry-1', date1);
    entry1.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    await repository.save(entry1);

    const entry2 = new CollecteEntry('entry-2', date2);
    entry2.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
    await repository.save(entry2);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result[0].createdAt).toEqual(date1);
    expect(result[1].createdAt).toEqual(date2);
  });

  it('retourne les entrées EN_COURS et VALIDEE', async () => {
    // Arrange
    const entry1 = new CollecteEntry();
    entry1.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    await repository.save(entry1);

    const entry2 = new CollecteEntry();
    entry2.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
    entry2.validate();
    await repository.save(entry2);

    const entry3 = new CollecteEntry();
    entry3.addItem({ productRef: 'PROD_3', family: 'F3', weightKg: 3 });
    await repository.save(entry3);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toHaveLength(3);
    const statuses = result.map((r) => r.status);
    expect(statuses).toContain(EntryStatus.EN_COURS);
    expect(statuses).toContain(EntryStatus.VALIDEE);
  });

  it('retourne une vue simplifiée (sans items)', async () => {
    // Arrange
    const entry = new CollecteEntry();
    entry.addItem({
      productRef: 'PROD_1',
      family: 'Protéines',
      subFamily: 'Sans porc',
      weightKg: 10,
    });
    entry.addItem({
      productRef: 'PROD_2',
      family: 'Fruits',
      weightKg: 5,
    });
    await repository.save(entry);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result[0]).toEqual({
      totalWeightKg: 15,
      status: EntryStatus.EN_COURS,
      createdAt: expect.any(Date),
    });
    // Pas d'items dans la vue
    expect(result[0]).not.toHaveProperty('items');
    expect(result[0]).not.toHaveProperty('id');
  });

  it('gère correctement les entrées vides', async () => {
    // Arrange
    const emptyEntry = new CollecteEntry();
    await repository.save(emptyEntry);

    const filledEntry = new CollecteEntry();
    filledEntry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    await repository.save(filledEntry);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0].totalWeightKg).toBe(0);
    expect(result[1].totalWeightKg).toBe(10);
  });

  it('calcule correctement les totaux avec arrondis', async () => {
    // Arrange
    const entry = new CollecteEntry();
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 5.3 }); // → 6
    entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 2.7 }); // → 3
    await repository.save(entry);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result[0].totalWeightKg).toBe(9); // 6 + 3
  });

  it('retourne plusieurs entrées dans l\'ordre', async () => {
    // Arrange
    const dates = [
      new Date('2024-01-01T10:00:00Z'),
      new Date('2024-01-02T10:00:00Z'),
      new Date('2024-01-03T10:00:00Z'),
    ];

    for (let i = 0; i < 3; i++) {
      const entry = new CollecteEntry(`entry-${i}`, dates[i]);
      entry.addItem({ productRef: `PROD_${i}`, family: 'F1', weightKg: i + 1 });
      await repository.save(entry);
    }

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toHaveLength(3);
    expect(result[0].createdAt).toEqual(dates[0]);
    expect(result[1].createdAt).toEqual(dates[1]);
    expect(result[2].createdAt).toEqual(dates[2]);
  });
});
