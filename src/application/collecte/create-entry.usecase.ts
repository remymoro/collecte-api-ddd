import { Inject, Injectable } from '@nestjs/common';
import { CollecteEntry } from '../../domain/collecte/collecte-entry.entity';
import type { CollecteEntryRepository } from '../../domain/collecte/collecte-entry.repository';
import type { ProductRepository } from '../../domain/product/product.repository';
import { ProductNotFoundError } from '../../domain/product/errors/product-not-found.error';



@Injectable()
export class CreateEntryUseCase {
  constructor(
    @Inject('CollecteEntryRepository')
    private readonly entryRepo: CollecteEntryRepository,
  ) {}

  async execute(): Promise<CollecteEntry> {
    const entry = new CollecteEntry();
    await this.entryRepo.save(entry);
    return entry;
  }
}
