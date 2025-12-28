import { ListProductsUseCase } from '../../../application/product/list-products.usecase';
import { InMemoryProductRepository } from '../../../infrastructure/product/in-memory-product.repository';
import { Product } from '../../../domain/product/product.entity';

describe('ListProductsUseCase', () => {
  it('retourne tous les produits du catalogue', async () => {
    const repo = new InMemoryProductRepository([
      new Product('PROD_1', 'Famille 1'),
      new Product('PROD_2', 'Famille 2', 'SousFamille 2'),
    ]);

    const useCase = new ListProductsUseCase(repo);

    const result = await useCase.execute();

    expect(result).toEqual([
      new Product('PROD_1', 'Famille 1'),
      new Product('PROD_2', 'Famille 2', 'SousFamille 2'),
    ]);
  });

  it('retourne une liste vide si le catalogue est vide', async () => {
    const repo = new InMemoryProductRepository();
    const useCase = new ListProductsUseCase(repo);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
