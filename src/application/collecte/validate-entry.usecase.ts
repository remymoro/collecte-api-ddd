import { Inject, Injectable } from '@nestjs/common';
import type { CollecteEntryRepository } from '../../domain/collecte/collecte-entry.repository';

@Injectable()
export class ValidateEntryUseCase {
  constructor(
    @Inject('CollecteEntryRepository')
    private readonly repository: CollecteEntryRepository,
  ) {}

  async execute(entryId: string): Promise<void> {
    const entry = await this.repository.findById(entryId);

    entry.validate();
    await this.repository.save(entry);
  }
}
