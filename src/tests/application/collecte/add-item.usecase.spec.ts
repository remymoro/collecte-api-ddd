import { AddItemUseCase } from '../../../application/collecte/add-item.usecase';
import { InMemoryCollecteEntryRepository } from '../../../infrastructure/collecte/in-memory-collecte-entry.repository';
import { InMemoryProductRepository } from '../../../infrastructure/product/in-memory-product.repository';
import { Product } from '../../../domain/product/product.entity';
import { CollecteEntry } from '../../../domain/collecte/collecte-entry.entity';

describe('AddItemUseCase (Option B snapshot)', () => {
  it('enrichit la saisie avec family/subFamily du catalogue', async () => {
    const entryRepo = new InMemoryCollecteEntryRepository();
    const productRepo = new InMemoryProductRepository([
      Product.create({
        reference: '01751144',
        family: 'Protéines',
        subFamily: 'Sans porc',
      }),
    ]);

    const draft = new CollecteEntry();
    await entryRepo.save(draft);

    const useCase = new AddItemUseCase(entryRepo, productRepo);

    const entry = await useCase.execute(draft.id, {
      productRef: '01751144',
      weightKg: 12,
    });

    expect(entry.entryItems).toEqual([
      {
        productRef: '01751144',
        family: 'Protéines',
        subFamily: 'Sans porc',
        weightKg: 12,
      },
    ]);
  });
});
