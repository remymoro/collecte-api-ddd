import { ListProductsUseCase } from '../../../application/product/list-products.usecase';
import { InMemoryProductRepository } from '../../../infrastructure/product/in-memory-product.repository';
import { Product } from '@domain/product/product.entity';

describe('ListProductsUseCase', () => {
  it('retourne tous les produits du catalogue', async () => {
    const prod1 = Product.create({ reference: 'PROD_1', family: 'Famille 1' });
    const prod2 = Product.create({
      reference: 'PROD_2',
      family: 'Famille 2',
      subFamily: 'SousFamille 2',
    });

    const repo = new InMemoryProductRepository([prod1, prod2]);

    const useCase = new ListProductsUseCase(repo);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].reference).toBe('PROD_1');
    expect(result[1].reference).toBe('PROD_2');
  });

  it('retourne une liste vide si le catalogue est vide', async () => {
    const repo = new InMemoryProductRepository();
    const useCase = new ListProductsUseCase(repo);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
