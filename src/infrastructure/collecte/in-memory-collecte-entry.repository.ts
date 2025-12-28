import { CollecteEntry } from '../../domain/collecte/collecte-entry.entity';
import { CollecteEntryRepository } from '../../domain/collecte/collecte-entry.repository';

export class InMemoryCollecteEntryRepository
  implements CollecteEntryRepository
{
  private readonly entries = new Map<string, CollecteEntry>();

  async save(entry: CollecteEntry): Promise<void> {
    const snapshot = CollecteEntry.rehydrate({
      id: entry.id,
      status: entry.entryStatus,
      createdAt: entry.entryCreatedAt,
      validatedAt: entry.validatedAt,
      items: entry.entryItems.map(item => ({ ...item })), // ✅
    });

    this.entries.set(entry.id, snapshot);
  }

  async findById(id: string): Promise<CollecteEntry> {
    const entry = this.entries.get(id);
    if (!entry) {
      throw new Error('Entry not found');
    }
    return entry;
  }

  async findAll(): Promise<CollecteEntry[]> {
    return Array.from(this.entries.values());
  }
}
