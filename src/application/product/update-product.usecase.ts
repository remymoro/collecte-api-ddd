import { Inject, Injectable } from '@nestjs/common';
import type { ProductRepository } from '../../domain/product/product.repository';
import { Product } from '../../domain/product/product.entity';
import { ProductNotFoundError } from '../../domain/product/errors/product-not-found.error';
import { ProductArchivedError } from '../../domain/product/errors/product-archived.error';

export type UpdateProductInput = {
  family: string;
  subFamily?: string;
};

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepo: ProductRepository,
  ) {}

  async execute(reference: string, input: UpdateProductInput): Promise<Product> {
  const product = await this.productRepo.findByReference(reference);

  if (!product) {
    throw new ProductNotFoundError(reference);
  }

  if (!product.isActive) {
    throw new ProductArchivedError(reference);
  }

  product.updateMetadata(input);

  await this.productRepo.save(product);

  return product;
}

}
