import { EntryStatusDto } from './entry-status.type';

export class EntryItemRemovedDto {
  status: EntryStatusDto;
  totalWeightKg: number;
}