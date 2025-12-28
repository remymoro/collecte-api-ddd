import { CollecteEntry } from './collecte-entry.entity';

export interface CollecteEntryRepository {
  save(entry: CollecteEntry): Promise<void>;
  findAll(): Promise<CollecteEntry[]>;
  findById(id: string): Promise<CollecteEntry>;
}
