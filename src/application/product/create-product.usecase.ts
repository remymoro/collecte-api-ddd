import { Inject, Injectable } from '@nestjs/common';
import { Product } from "@domain/product/product.entity";
import type { ProductRepository } from "@domain/product/product.repository";
import { ProductAlreadyExistsError } from "@domain/product/errors/product-already-exists.error";

export type CreateProductInput = {
  reference: string;
  family: string;
  subFamily?: string;
};

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepo: ProductRepository,
  ) {}

  async execute(input: {
    reference: string;
    family: string;
    subFamily?: string;
  }): Promise<Product> {
    const existing = await this.productRepo.findByReference(input.reference);
    if (existing) {
      throw new ProductAlreadyExistsError(input.reference);
    }

   const product = Product.create({
      reference: input.reference,
      family: input.family,
      subFamily: input.subFamily,
    });

    await this.productRepo.save(product);
    return product;
  }
}
