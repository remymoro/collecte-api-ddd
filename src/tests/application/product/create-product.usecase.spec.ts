import { CreateProductUseCase } from '../../../application/product/create-product.usecase';
import { Product } from '@domain/product/product.entity';
import { ProductAlreadyExistsError } from '@domain/product/errors/product-already-exists.error';
import { InMemoryProductRepository } from '../../../infrastructure/product/in-memory-product.repository';

describe('CreateProductUseCase', () => {
  it('crée un produit si la référence n\'existe pas', async () => {
    const productRepo = new InMemoryProductRepository([]);
    const useCase = new CreateProductUseCase(productRepo);

    const product = await useCase.execute({
      reference: 'PROD_1',
      family: 'Protéines',
      subFamily: 'Sans porc',
    });

    expect(product).toBeInstanceOf(Product);
    expect(product.reference).toBe('PROD_1');
    expect(product.family).toBe('Protéines');
    expect(product.subFamily).toBe('Sans porc');

    const stored = await productRepo.findByReference('PROD_1');
    expect(stored).not.toBeNull();
  });

  it('refuse la création si la référence existe déjà', async () => {
    const existing = Product.create({
      reference: 'PROD_1',
      family: 'Famille 1',
    });

    const productRepo = new InMemoryProductRepository([existing]);
    const useCase = new CreateProductUseCase(productRepo);

    await expect(
      useCase.execute({
        reference: 'PROD_1',
        family: 'Nouvelle famille',
      }),
    ).rejects.toThrow(ProductAlreadyExistsError);
  });
});
