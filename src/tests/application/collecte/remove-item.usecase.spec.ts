import { RemoveItemUseCase } from '../../../application/collecte/remove-item.usecase';
import { InMemoryCollecteEntryRepository } from '../../../infrastructure/collecte/in-memory-collecte-entry.repository';
import { CollecteEntry } from '../../../domain/collecte/collecte-entry.entity';
import { EntryAlreadyValidatedError } from '../../../domain/collecte/errors/entry-already-validated.error';

describe('RemoveItemUseCase', () => {
  let repository: InMemoryCollecteEntryRepository;
  let useCase: RemoveItemUseCase;

  beforeEach(() => {
    repository = new InMemoryCollecteEntryRepository();
    useCase = new RemoveItemUseCase(repository);
  });

  it('supprime un item par index', async () => {
    // Arrange
    const entry = new CollecteEntry();
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
    entry.addItem({ productRef: 'PROD_3', family: 'F3', weightKg: 3 });
    await repository.save(entry);

    // Act
    const result = await useCase.execute(entry.id, 1);

    // Assert
    expect(result.entryItems).toHaveLength(2);
    expect(result.entryItems[0].productRef).toBe('PROD_1');
    expect(result.entryItems[1].productRef).toBe('PROD_3');
  });

  it('persiste l\'entrée après suppression', async () => {
    // Arrange
    const entry = new CollecteEntry();
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
    await repository.save(entry);

    // Act
    await useCase.execute(entry.id, 0);

    // Assert
    const saved = await repository.findById(entry.id);
    expect(saved?.entryItems).toHaveLength(1);
    expect(saved?.entryItems[0].productRef).toBe('PROD_2');
  });

  it('met à jour le poids total après suppression', async () => {
    // Arrange
    const entry = new CollecteEntry();
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
    await repository.save(entry);

    // Act
    const result = await useCase.execute(entry.id, 0);

    // Assert
    expect(result.totalWeightKg).toBe(5);
  });

  it('supprime le premier item', async () => {
    // Arrange
    const entry = new CollecteEntry();
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
    await repository.save(entry);

    // Act
    const result = await useCase.execute(entry.id, 0);

    // Assert
    expect(result.entryItems).toHaveLength(1);
    expect(result.entryItems[0].productRef).toBe('PROD_2');
  });

  it('supprime le dernier item', async () => {
    // Arrange
    const entry = new CollecteEntry();
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
    await repository.save(entry);

    // Act
    const result = await useCase.execute(entry.id, 1);

    // Assert
    expect(result.entryItems).toHaveLength(1);
    expect(result.entryItems[0].productRef).toBe('PROD_1');
  });

  it('refuse de supprimer un item d\'une entrée validée', async () => {
    // Arrange
    const entry = new CollecteEntry();
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    entry.validate();
    await repository.save(entry);

    // Act & Assert
    await expect(useCase.execute(entry.id, 0)).rejects.toThrow(
      EntryAlreadyValidatedError,
    );
  });

  it('retourne l\'entrée mise à jour', async () => {
    // Arrange
    const entry = new CollecteEntry();
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
    await repository.save(entry);

    // Act
    const result = await useCase.execute(entry.id, 0);

    // Assert
    expect(result).toBeInstanceOf(CollecteEntry);
    expect(result.id).toBe(entry.id);
    expect(result.entryItems).toHaveLength(1);
  });

  it('permet de vider complètement une entrée', async () => {
    // Arrange
    const entry = new CollecteEntry();
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    await repository.save(entry);

    // Act
    const result = await useCase.execute(entry.id, 0);

    // Assert
    expect(result.entryItems).toHaveLength(0);
    expect(result.totalWeightKg).toBe(0);
  });

  it('conserve les autres items après suppression', async () => {
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
    await useCase.execute(entry.id, 1); // Supprime PROD_2

    // Assert
    const saved = await repository.findById(entry.id);
    const items = saved?.entryItems || [];

    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({
      productRef: 'PROD_1',
      family: 'Protéines',
      subFamily: 'Sans porc',
      weightKg: 10,
    });
    expect(items[1]).toEqual({
      productRef: 'PROD_3',
      family: 'Légumes',
      subFamily: 'Verts',
      weightKg: 3,
    });
  });
});
