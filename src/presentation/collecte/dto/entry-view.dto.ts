import { EntryStatus } from '../../../domain/collecte/enums/entry-status.enum';

export class EntryViewDto {
  totalWeightKg: number;
  status: EntryStatus;
  createdAt: Date;
}
