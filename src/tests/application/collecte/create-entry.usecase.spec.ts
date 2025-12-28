import { CreateEntryUseCase } from '../../../application/collecte/create-entry.usecase';
import { InMemoryCollecteEntryRepository } from '../../../infrastructure/collecte/in-memory-collecte-entry.repository';
import { InMemoryProductRepository } from '../../../infrastructure/product/in-memory-product.repository';
import { Product } from '../../../domain/product/product.entity';

describe('CreateEntryUseCase', () => {
  it('crée et sauvegarde une saisie EN_COURS', async () => {
    const repo = new InMemoryCollecteEntryRepository();
    const productRepo = new InMemoryProductRepository([
      new Product('PROD_1', 'Famille 1', 'SousFamille 1'),
      new Product('PROD_2', 'Famille 2'),
    ]);
    const useCase = new CreateEntryUseCase(repo, productRepo);

    await useCase.execute({
      items: [
        { productRef: 'PROD_1', weightKg: 10 },
        { productRef: 'PROD_2', weightKg: 5 },
      ],
    });

    const all = await repo.findAll();

    expect(all.length).toBe(1);
  });
});
