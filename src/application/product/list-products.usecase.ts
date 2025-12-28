import { Inject, Injectable } from '@nestjs/common';
import type { ProductRepository } from '../../domain/product/product.repository';
import { Product } from '../../domain/product/product.entity';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly repository: ProductRepository,
  ) {}

  async execute(): Promise<Product[]> {
    return this.repository.findAll();
  }
}
