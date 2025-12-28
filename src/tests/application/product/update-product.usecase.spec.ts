import { UpdateProductUseCase } from '../../../application/product/update-product.usecase';
import { InMemoryProductRepository } from '../../../infrastructure/product/in-memory-product.repository';
import { Product } from '@domain/product/product.entity';
import { ProductNotFoundError } from '@domain/product/errors/product-not-found.error';

describe('UpdateProductUseCase', () => {
  it('met à jour family / subFamily sans changer la référence', async () => {
    const repo = new InMemoryProductRepository([
      Product.create({
        reference: 'PROD_1',
        family: 'Ancienne famille',
        subFamily: 'Ancienne sous-famille',
      }),
    ]);

    const useCase = new UpdateProductUseCase(repo);

    const updated = await useCase.execute('PROD_1', {
      family: 'Nouvelle famille',
      subFamily: 'Nouvelle sous-famille',
    });

    expect(updated.reference).toBe('PROD_1');
    expect(updated.family).toBe('Nouvelle famille');
    expect(updated.subFamily).toBe('Nouvelle sous-famille');

    const persisted = await repo.findByReference('PROD_1');
    expect(persisted?.family).toBe('Nouvelle famille');
  });

  it('refuse la mise à jour si le produit n\'existe pas', async () => {
    const repo = new InMemoryProductRepository();
    const useCase = new UpdateProductUseCase(repo);

    await expect(
      useCase.execute('UNKNOWN', {
        family: 'Test',
      }),
    ).rejects.toThrow(ProductNotFoundError);
  });
});
