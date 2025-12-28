import { IsString, IsNumber } from 'class-validator';

export class AddEntryItemDto {
  @IsString()
  productRef: string;

  @IsNumber()
  weightKg: number;
}
