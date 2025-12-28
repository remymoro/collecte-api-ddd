import { ValidateEntryUseCase } from '../../../application/collecte/validate-entry.usecase';
import { InMemoryCollecteEntryRepository } from '../../../infrastructure/collecte/in-memory-collecte-entry.repository';
import { CollecteEntry } from '../../../domain/collecte/collecte-entry.entity';
import { EntryStatus } from '../../../domain/collecte/enums/entry-status.enum';
import { EmptyEntryError } from '../../../domain/collecte/errors/empty-entry.error';
import { EntryAlreadyValidatedError } from '../../../domain/collecte/errors/entry-already-validated.error';

describe('ValidateEntryUseCase', () => {
  let repository: InMemoryCollecteEntryRepository;
  let useCase: ValidateEntryUseCase;

  beforeEach(() => {
    repository = new InMemoryCollecteEntryRepository();
    useCase = new ValidateEntryUseCase(repository);
  });

  it('valide une entrée avec des items', async () => {
    // Arrange
    const entry = new CollecteEntry();
    entry.addItem({
      productRef: 'PROD_1',
      family: 'Protéines',
      weightKg: 10,
    });
    await repository.save(entry);

    // Act
    await useCase.execute(entry.id);

    // Assert
    const validated = await repository.findById(entry.id);
    expect(validated?.entryStatus).toBe(EntryStatus.VALIDEE);
    expect(validated?.entryValidatedAt).toBeInstanceOf(Date);
  });

  it('persiste l\'entrée après validation', async () => {
    // Arrange
    const entry = new CollecteEntry();
    entry.addItem({
      productRef: 'PROD_1',
      family: 'Fruits',
      weightKg: 5,
    });
    await repository.save(entry);

    // Act
    await useCase.execute(entry.id);

    // Assert
    const saved = await repository.findById(entry.id);
    expect(saved).toBeDefined();
    expect(saved?.entryStatus).toBe(EntryStatus.VALIDEE);
  });

  it('refuse de valider une entrée vide', async () => {
    // Arrange
    const entry = new CollecteEntry();
    await repository.save(entry);

    // Act & Assert
    await expect(useCase.execute(entry.id)).rejects.toThrow(EmptyEntryError);
  });

  it('refuse de valider une entrée déjà validée', async () => {
    // Arrange
    const entry = new CollecteEntry();
    entry.addItem({
      productRef: 'PROD_1',
      family: 'Protéines',
      weightKg: 10,
    });
    entry.validate();
    await repository.save(entry);

    // Act & Assert
    await expect(useCase.execute(entry.id)).rejects.toThrow(
      EntryAlreadyValidatedError,
    );
  });

  it('valide une entrée avec plusieurs items', async () => {
    // Arrange
    const entry = new CollecteEntry();
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
    entry.addItem({ productRef: 'PROD_3', family: 'F3', weightKg: 3 });
    await repository.save(entry);

    // Act
    await useCase.execute(entry.id);

    // Assert
    const validated = await repository.findById(entry.id);
    expect(validated?.entryStatus).toBe(EntryStatus.VALIDEE);
    expect(validated?.entryItems).toHaveLength(3);
    expect(validated?.totalWeightKg).toBe(18);
  });

  it('conserve tous les items lors de la validation', async () => {
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
    await useCase.execute(entry.id);

    // Assert
    const validated = await repository.findById(entry.id);
    const items = validated?.entryItems || [];

    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({
      productRef: 'PROD_1',
      family: 'Protéines',
      subFamily: 'Sans porc',
      weightKg: 10,
    });
    expect(items[1]).toEqual({
      productRef: 'PROD_2',
      family: 'Fruits',
      subFamily: undefined,
      weightKg: 5,
    });
  });
});