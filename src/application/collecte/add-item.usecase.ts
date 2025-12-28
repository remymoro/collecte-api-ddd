import { Inject, Injectable } from '@nestjs/common';
import type { CollecteEntryRepository } from '../../domain/collecte/collecte-entry.repository';
import { CollecteEntry } from '../../domain/collecte/collecte-entry.entity';
import type { ProductRepository } from '../../domain/product/product.repository';
import { ProductNotFoundError } from '../../domain/product/errors/product-not-found.error';
import { ProductArchivedError } from '../../domain/product/errors/product-archived.error';
export type AddItemInput = {
  productRef: string;
  weightKg: number;
};

@Injectable()
export class AddItemUseCase {
  constructor(
    @Inject('CollecteEntryRepository')
    private readonly entryRepo: CollecteEntryRepository,

    @Inject('ProductRepository')
    private readonly productRepo: ProductRepository,
  ) {}

  async execute(entryId: string, input: AddItemInput): Promise<CollecteEntry> {
  const entry = await this.entryRepo.findById(entryId);

  const product = await this.productRepo.findByReference(input.productRef);
  if (!product) {
    throw new ProductNotFoundError(input.productRef);
  }

  if (!product.isActive) {
    throw new ProductArchivedError(product.reference);
  }

  entry.addItem({
    productRef: product.reference,
    family: product.family,
    subFamily: product.subFamily,
    weightKg: input.weightKg,
  });

  await this.entryRepo.save(entry);
  return entry;
}

}
