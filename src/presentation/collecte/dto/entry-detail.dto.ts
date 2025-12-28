import { EntryStatusDto } from './entry-status.type';
import { EntryItemDto } from './entry-item.dto';

export class EntryDetailDto {
  id: string;
  status: EntryStatusDto;
  totalWeightKg: number;
  createdAt: Date;
  validatedAt?: Date;
  items: EntryItemDto[];
}
