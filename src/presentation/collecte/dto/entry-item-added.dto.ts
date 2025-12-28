import { EntryStatusDto } from './entry-status.type';

export class EntryItemAddedDto {
  status: EntryStatusDto;
  totalWeightKg: number;
}