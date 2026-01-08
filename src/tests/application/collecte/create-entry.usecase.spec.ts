import { CreateEntryUseCase } from '../../../application/collecte/create-entry.usecase';
import { InMemoryCollecteEntryRepository } from '../../../infrastructure/collecte/in-memory-collecte-entry.repository';
import { CollecteEntry } from '@domain/collecte/collecte-entry.entity';
import { EntryStatus } from '@domain/collecte/enums/entry-status.enum';
import { CampaignId } from '@domain/campaign/value-objects/campaign-id.vo';
import { StoreId } from '@domain/store/value-objects/store-id.vo';
import { CenterId } from '@domain/center/value-objects/center-id.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';

describe('CreateEntryUseCase', () => {
  const campaignId = CampaignId.generate();
  const storeId = StoreId.generate();
  const centerId = CenterId.generate();
  const userId = UserId.generate();

  const context = {
    campaignId: campaignId.toString(),
    storeId: storeId.toString(),
    centerId: centerId.toString(),
    userId: userId.toString(),
  };

  const contextVOs = {
    campaignId,
    storeId,
    centerId,
    userId,
  };

  it('crée et sauvegarde une saisie EN_COURS', async () => {
    const repo = new InMemoryCollecteEntryRepository();
    const useCase = new CreateEntryUseCase(repo);

    const created = await useCase.execute(context);

    const all = await repo.findAll();

    expect(all.length).toBe(1);
    expect(created.status).toBe(EntryStatus.EN_COURS);
  });

  it('retourne l\'entrée active existante (pas de nouvelle entry vide)', async () => {
    const repo = new InMemoryCollecteEntryRepository();
    const useCase = new CreateEntryUseCase(repo);

    const existing = CollecteEntry.create(contextVOs);
    await repo.save(existing);

    const result = await useCase.execute(context);

    expect(result.id.equals(existing.id)).toBe(true);
    const all = await repo.findAll();
    expect(all.length).toBe(1);
  });
});
