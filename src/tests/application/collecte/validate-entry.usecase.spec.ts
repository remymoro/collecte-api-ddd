import { ValidateEntryUseCase } from '../../../application/collecte/validate-entry.usecase';
import { InMemoryCollecteEntryRepository } from '../../../infrastructure/collecte/in-memory-collecte-entry.repository';
import { CollecteEntry } from '@domain/collecte/collecte-entry.entity';
import { EntryStatus } from '@domain/collecte/enums/entry-status.enum';
import { EmptyEntryError } from '@domain/collecte/errors/empty-entry.error';
import { EntryAlreadyValidatedError } from '@domain/collecte/errors/entry-already-validated.error';
import { CampaignId } from '@domain/campaign/value-objects/campaign-id.vo';
import { StoreId } from '@domain/store/value-objects/store-id.vo';
import { CenterId } from '@domain/center/value-objects/center-id.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';

describe('ValidateEntryUseCase', () => {
  let repository: InMemoryCollecteEntryRepository;
  let useCase: ValidateEntryUseCase;
  let context: {
    campaignId: CampaignId;
    storeId: StoreId;
    centerId: CenterId;
    userId: UserId;
  };

  beforeEach(() => {
    repository = new InMemoryCollecteEntryRepository();
    useCase = new ValidateEntryUseCase(repository);
    context = {
      campaignId: CampaignId.generate(),
      storeId: StoreId.generate(),
      centerId: CenterId.generate(),
      userId: UserId.generate(),
    };
  });

  it('valide une saisie et la persiste (statut VALIDEE + validatedAt renseigné)', async () => {
    // Arrange
    const entry = CollecteEntry.create(context);
    entry.addItem({ productRef: 'PROD_1', family: 'Protéines', weightKg: 10 });
    await repository.save(entry);

    // Act
    await useCase.execute(entry.id.toString());

    // Assert
    const validated = await repository.findById(entry.id);
    expect(validated.entryStatus).toBe(EntryStatus.VALIDEE);
    expect(validated.entryValidatedAt).toBeInstanceOf(Date);
    expect(validated.entryItems).toHaveLength(1);
  });

  it('refuse de valider une entrée vide', async () => {
    // Arrange
    const entry = CollecteEntry.create(context);
    await repository.save(entry);

    // Act & Assert
    await expect(useCase.execute(entry.id.toString())).rejects.toThrow(EmptyEntryError);
  });

  it('refuse de valider une entrée déjà validée', async () => {
    // Arrange
    const entry = CollecteEntry.create(context);
    entry.addItem({
      productRef: 'PROD_1',
      family: 'Protéines',
      weightKg: 10,
    });
    entry.validate();
    await repository.save(entry);

    // Act & Assert
    await expect(useCase.execute(entry.id.toString())).rejects.toThrow(
      EntryAlreadyValidatedError,
    );
  });

  it('fige la saisie après validation (add/remove refusés)', async () => {
    // Arrange
    const entry = CollecteEntry.create(context);
    entry.addItem({ productRef: 'PROD_1', family: 'F1', weightKg: 10 });
    await repository.save(entry);

    // Act
    await useCase.execute(entry.id.toString());

    // Assert
    const validated = await repository.findById(entry.id);
    expect(() =>
      validated.addItem({ productRef: 'PROD_2', family: 'F2', weightKg: 5 }),
    ).toThrow(EntryAlreadyValidatedError);
    expect(() => validated.removeItem(0)).toThrow(EntryAlreadyValidatedError);
  });
});