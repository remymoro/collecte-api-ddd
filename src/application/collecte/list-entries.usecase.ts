import { Inject, Injectable } from '@nestjs/common';
import { EntryStatus } from '../../domain/collecte/enums/entry-status.enum';
import type { CollecteEntryRepository } from '../../domain/collecte/collecte-entry.repository';

export type EntryView = {
  totalWeightKg: number;
  status: EntryStatus;
  createdAt: Date;
};

@Injectable()
export class ListEntriesUseCase {
  constructor(
    @Inject('CollecteEntryRepository')
    private readonly repository: CollecteEntryRepository,
  ) {}

  async execute(): Promise<EntryView[]> {
    const entries = await this.repository.findAll();

    return entries.map((entry) => ({
      totalWeightKg: entry.totalWeightKg,
      status: entry.entryStatus,
      createdAt: entry.entryCreatedAt,
    }));
  }
}
