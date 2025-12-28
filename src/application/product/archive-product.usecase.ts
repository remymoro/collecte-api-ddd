import { Inject, Injectable } from '@nestjs/common';
import type { ProductRepository } from '../../domain/product/product.repository';
import { ProductNotFoundError } from '../../domain/product/errors/product-not-found.error';
import { Product } from '../../domain/product/product.entity';

@Injectable()
export class ArchiveProductUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepo: ProductRepository,
  ) {}

  async execute(reference: string): Promise<Product> {
    const product = await this.productRepo.findByReference(reference);

    if (!product) {
      throw new ProductNotFoundError(reference);
    }

    product.archive(); // 🔒 règle métier
    await this.productRepo.save(product);

    return product;
  }
}
