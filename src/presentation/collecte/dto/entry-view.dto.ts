import { EntryStatusDto } from './entry-status.type';

export class EntryViewDto {
  totalWeightKg: number;
  status: EntryStatusDto;
  createdAt: Date;
}
