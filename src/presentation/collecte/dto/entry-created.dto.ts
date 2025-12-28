import { EntryStatusDto } from './entry-status.type';

export class EntryCreatedDto {
  id: string;
  totalWeightKg: number;
  status: EntryStatusDto;
}