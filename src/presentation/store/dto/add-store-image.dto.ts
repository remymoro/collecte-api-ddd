// src/presentation/store/dto/add-store-image.dto.ts

import { IsBoolean, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class AddStoreImageDto {
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  @IsNotEmpty()
  url: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
