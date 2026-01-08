import { Inject, Injectable } from '@nestjs/common';
import type { CollecteEntryRepository } from '@domain/collecte/collecte-entry.repository';
import { CollecteEntryId } from '@domain/collecte/value-objects/collecte-entry-id.vo';

@Injectable()
export class ValidateEntryUseCase {
  constructor(
    @Inject('CollecteEntryRepository')
    private readonly repository: CollecteEntryRepository,
  ) {}

  async execute(entryId: string): Promise<void> {
    const entry = await this.repository.findById(CollecteEntryId.from(entryId));

    entry.validate();
    await this.repository.save(entry);
  }
}
