import { Inject, Injectable } from '@nestjs/common';
import type { CollecteEntryRepository } from '@domain/collecte/collecte-entry.repository';
import { CollecteEntry } from '@domain/collecte/collecte-entry.entity';
import { CollecteEntryId } from '@domain/collecte/value-objects/collecte-entry-id.vo';

@Injectable()
export class RemoveItemUseCase {
  constructor(
    @Inject('CollecteEntryRepository')
    private readonly repository: CollecteEntryRepository,
  ) {}

  async execute(entryId: string, index: number): Promise<CollecteEntry> {
    const entry = await this.repository.findById(CollecteEntryId.from(entryId));

    entry.removeItem(index);
    await this.repository.save(entry);

    return entry;
  }
}
