import { EntryStatus } from '../../../domain/collecte/enums/entry-status.enum';
import { EntryItemDto } from './entry-item.dto';

export class EntryDetailDto {
  id: string;
  status: EntryStatus;
  totalWeightKg: number;
  createdAt: Date;
  validatedAt?: Date;
  items: EntryItemDto[];
}
