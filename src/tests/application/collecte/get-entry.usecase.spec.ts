import { GetEntryUseCase } from '../../../application/collecte/get-entry.usecase';
import { InMemoryCollecteEntryRepository } from '../../../infrastructure/collecte/in-memory-collecte-entry.repository';
import { CollecteEntry } from '@domain/collecte/collecte-entry.entity';
import { EntryStatus } from '@domain/collecte/enums/entry-status.enum';
import { EntryNotFoundError } from '@domain/collecte/errors/entry-not-found.error';
import { CollecteEntryId } from '@domain/collecte/value-objects/collecte-entry-id.vo';
import { CampaignId } from '@domain/campaign/value-objects/campaign-id.vo';
import { StoreId } from '@domain/store/value-objects/store-id.vo';
import { CenterId } from '@domain/center/value-objects/center-id.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';

describe('GetEntryUseCase', () => {
  let repository: InMemoryCollecteEntryRepository;
  let useCase: GetEntryUseCase;

  let context: {
    campaignId: CampaignId;
    storeId: StoreId;
    centerId: CenterId;
    userId: UserId;
  };

  beforeEach(() => {
    repository = new InMemoryCollecteEntryRepository();
    useCase = new GetEntryUseCase(repository);
    context = {
      campaignId: CampaignId.generate(),
      storeId: StoreId.generate(),
      centerId: CenterId.generate(),
      userId: UserId.generate(),
    };
  });

  it('récupère une entrée EN_COURS par son ID', async () => {
    // Arrange
    const entryId = CollecteEntryId.generate();
    const entry = CollecteEntry.rehydrate({
      id: entryId,
      context,
      status: EntryStatus.EN_COURS,
      createdAt: new Date(),
      items: [],
    });
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    await repository.save(entry);

    // Act
    const result = await useCase.execute(entryId.toString());

    // Assert
    expect(result).toBeInstanceOf(CollecteEntry);
    expect(result.id.equals(entryId)).toBe(true);
    expect(result.entryStatus).toBe(EntryStatus.EN_COURS);
  });

  it('récupère une entrée VALIDEE par son ID', async () => {
    // Arrange
    const entryId = CollecteEntryId.generate();
    const entry = CollecteEntry.rehydrate({
      id: entryId,
      context,
      status: EntryStatus.EN_COURS,
      createdAt: new Date(),
      items: [],
    });
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    entry.validate();
    await repository.save(entry);

    // Act
    const result = await useCase.execute(entryId.toString());

    // Assert
    expect(result.entryStatus).toBe(EntryStatus.VALIDEE);
    expect(result.entryValidatedAt).toBeInstanceOf(Date);
  });

  it('récupère une entrée avec tous ses items', async () => {
    // Arrange
    const entry = CollecteEntry.create(context);
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
    const result = await useCase.execute(entry.id.toString());

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
    const entryId = CollecteEntryId.generate();
    const entry = CollecteEntry.rehydrate({
      id: entryId,
      context,
      status: EntryStatus.EN_COURS,
      createdAt: new Date(),
      items: [],
    });
    await repository.save(entry);

    // Act
    const result = await useCase.execute(entryId.toString());

    // Assert
    expect(result.entryItems).toHaveLength(0);
    expect(result.totalWeightKg).toBe(0);
  });

  it('récupère le poids total correct', async () => {
    // Arrange
    const entry = CollecteEntry.create(context);
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    entry.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 });
    entry.addItem({ productRef: 'PROD_3', family: 'F3', weightKg: 3 });
    await repository.save(entry);

    // Act
    const result = await useCase.execute(entry.id.toString());

    // Assert
    expect(result.totalWeightKg).toBe(18);
  });

  it('récupère la date de création', async () => {
    // Arrange
    const entryId = CollecteEntryId.generate();
    const fixedDate = new Date('2024-01-15T10:00:00Z');
    const entry = CollecteEntry.rehydrate({
      id: entryId,
      context,
      status: EntryStatus.EN_COURS,
      createdAt: fixedDate,
      items: [],
    });
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    await repository.save(entry);

    // Act
    const result = await useCase.execute(entryId.toString());

    // Assert
    expect(result.entryCreatedAt).toEqual(fixedDate);
  });

  it('récupère la date de validation pour une entrée validée', async () => {
    // Arrange
    const entry = CollecteEntry.create(context);
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    entry.validate();
    const validatedAt = entry.entryValidatedAt;
    await repository.save(entry);

    // Act
    const result = await useCase.execute(entry.id.toString());

    // Assert
    expect(result.entryValidatedAt).toEqual(validatedAt);
  });

  it('throw une erreur pour un ID inexistant', async () => {
    // Act & Assert
    const nonExistentId = CollecteEntryId.generate();
    await expect(useCase.execute(nonExistentId.toString())).rejects.toThrow(
      EntryNotFoundError,
    );
  });

  it('récupère correctement une entrée rehydratée', async () => {
    // Arrange
    const entryId = CollecteEntryId.generate();
    const rehydrated = CollecteEntry.rehydrate({
      id: entryId,
      context,
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
    const result = await useCase.execute(entryId.toString());

    // Assert
    expect(result.id.equals(entryId)).toBe(true);
    expect(result.entryStatus).toBe(EntryStatus.VALIDEE);
    expect(result.entryItems).toHaveLength(1);
    expect(result.totalWeightKg).toBe(10);
  });
});
