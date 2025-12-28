import { GetEntryUseCase } from '../../../application/collecte/get-entry.usecase';
import { InMemoryCollecteEntryRepository } from '../../../infrastructure/collecte/in-memory-collecte-entry.repository';
import { CollecteEntry } from '@domain/collecte/collecte-entry.entity';
import { EntryStatus } from '@domain/collecte/enums/entry-status.enum';

describe('GetEntryUseCase', () => {
  let repository: InMemoryCollecteEntryRepository;
  let useCase: GetEntryUseCase;

  beforeEach(() => {
    repository = new InMemoryCollecteEntryRepository();
    useCase = new GetEntryUseCase(repository);
  });

  it('récupère une entrée EN_COURS par son ID', async () => {
    // Arrange
    const entry = new CollecteEntry('entry-123');
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    await repository.save(entry);

    // Act
    const result = await useCase.execute('entry-123');

    // Assert
    expect(result).toBeInstanceOf(CollecteEntry);
    expect(result.id).toBe('entry-123');
    expect(result.entryStatus).toBe(EntryStatus.EN_COURS);
  });

  it('récupère une entrée VALIDEE par son ID', async () => {
    // Arrange
    const entry = new CollecteEntry('entry-456');
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    entry.validate();
    await repository.save(entry);

    // Act
    const result = await useCase.execute('entry-456');

    // Assert
    expect(result.entryStatus).toBe(EntryStatus.VALIDEE);
    expect(result.entryValidatedAt).toBeInstanceOf(Date);
  });

  it('récupère une entrée avec tous ses items', async () => {
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
    entry.addItem({
      productRef: 'PROD_3',
      family: 'Légumes',
      subFamily: 'Verts',
      weightKg: 3,
    });
    await repository.save(entry);

    // Act
    const result = await useCase.execute(entry.id);

    // Assert
    expect(result.entryItems).toHaveLength(3);
    expect(result.entryItems[0]).toEqual({
      productRef: 'PROD_1',
      family: 'Protéines',
      subFamily: 'Sans porc',
      weightKg: 10,
    });
    expect(result.entryItems[1]).toEqual({
      productRef: 'PROD_2',
      family: 'Fruits',
      subFamily: undefined,
      weightKg: 5,
    });
    expect(result.entryItems[2]).toEqual({
      productRef: 'PROD_3',
      family: 'Légumes',
      subFamily: 'Verts',
      weightKg: 3,
    });
  });

  it('récupère une entrée vide', async () => {
    // Arrange
    const entry = new CollecteEntry('empty-entry');
    await repository.save(entry);

    // Act
    const result = await useCase.execute('empty-entry');

    // Assert
    expect(result.entryItems).toHaveLength(0);
    expect(result.totalWeightKg).toBe(0);
  });

  it('récupère le poids total correct', async () => {
    // Arrange
    const entry = new CollecteEntry();
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
    entry.addItem({ productRef: 'PROD_3', family: 'F3', weightKg: 3 });
    await repository.save(entry);

    // Act
    const result = await useCase.execute(entry.id);

    // Assert
    expect(result.totalWeightKg).toBe(18);
  });

  it('récupère la date de création', async () => {
    // Arrange
    const fixedDate = new Date('2024-01-15T10:00:00Z');
    const entry = new CollecteEntry('entry-with-date', fixedDate);
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    await repository.save(entry);

    // Act
    const result = await useCase.execute('entry-with-date');

    // Assert
    expect(result.entryCreatedAt).toEqual(fixedDate);
  });

  it('récupère la date de validation pour une entrée validée', async () => {
    // Arrange
    const entry = new CollecteEntry();
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    entry.validate();
    const validatedAt = entry.entryValidatedAt;
    await repository.save(entry);

    // Act
    const result = await useCase.execute(entry.id);

    // Assert
    expect(result.entryValidatedAt).toEqual(validatedAt);
  });

  it('throw une erreur pour un ID inexistant', async () => {
    // Act & Assert
    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      'Entry not found',
    );
  });

  it('récupère correctement une entrée rehydratée', async () => {
    // Arrange
    const rehydrated = CollecteEntry.rehydrate({
      id: 'rehydrated-123',
      status: EntryStatus.VALIDEE,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      validatedAt: new Date('2024-01-01T12:00:00Z'),
      items: [
        {
          productRef: 'PROD_1',
          family: 'Protéines',
          subFamily: 'Sans porc',
          weightKg: 10,
        },
      ],
    });
    await repository.save(rehydrated);

    // Act
    const result = await useCase.execute('rehydrated-123');

    // Assert
    expect(result.id).toBe('rehydrated-123');
    expect(result.entryStatus).toBe(EntryStatus.VALIDEE);
    expect(result.entryItems).toHaveLength(1);
    expect(result.totalWeightKg).toBe(10);
  });
});
