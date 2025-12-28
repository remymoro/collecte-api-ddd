import { Inject, Injectable } from '@nestjs/common';
import type { CollecteEntryRepository } from '../../domain/collecte/collecte-entry.repository';
import { CollecteEntry } from '../../domain/collecte/collecte-entry.entity';

@Injectable()
export class GetEntryUseCase {
  constructor(
    @Inject('CollecteEntryRepository')
    private readonly repository: CollecteEntryRepository,
  ) {}

  async execute(entryId: string): Promise<CollecteEntry> {
    const entry = await this.repository.findById(entryId);
    return entry;
  }
}
