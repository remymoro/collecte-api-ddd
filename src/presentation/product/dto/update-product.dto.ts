// update-product.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  family!: string;

  @IsOptional()
  @IsString()
  subFamily?: string;
}
