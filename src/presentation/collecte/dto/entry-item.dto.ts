import { IsString, IsNumber } from 'class-validator';

export class EntryItemDto {
  @IsString()
  productRef: string;

  @IsNumber()
  weightKg: number;
}
