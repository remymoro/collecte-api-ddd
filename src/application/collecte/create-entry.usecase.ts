import { Inject, Injectable } from '@nestjs/common';
import { CollecteEntry } from '@domain/collecte/collecte-entry.entity';
import type { CollecteEntryRepository } from '@domain/collecte/collecte-entry.repository';

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
