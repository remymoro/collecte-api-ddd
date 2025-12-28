import { EntryStatusDto } from './entry-status.type';

export class EntryValidatedDto {
  status: EntryStatusDto;
  totalWeightKg: number;
  validatedAt: Date;
}