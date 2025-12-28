import { ArchiveProductUseCase } from '../../../application/product/archive-product.usecase';
import { InMemoryProductRepository } from '../../../infrastructure/product/in-memory-product.repository';
import { Product } from '@domain/product/product.entity';
import { ProductNotFoundError } from '@domain/product/errors/product-not-found.error';

describe('ArchiveProductUseCase', () => {
  it('archive un produit existant', async () => {
    const repo = new InMemoryProductRepository([
      Product.create({
        reference: 'PROD_1',
        family: 'Famille',
      }),
    ]);

    const useCase = new ArchiveProductUseCase(repo);

    await useCase.execute('PROD_1');

    const product = await repo.findByReference('PROD_1');
    expect(product?.isActive).toBe(false);
  });

  it('échoue si le produit n\'existe pas', async () => {
    const repo = new InMemoryProductRepository();
    const useCase = new ArchiveProductUseCase(repo);

    await expect(useCase.execute('UNKNOWN')).rejects.toThrow(
      ProductNotFoundError,
    );
  });
});
