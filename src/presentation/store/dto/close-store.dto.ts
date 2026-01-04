// src/presentation/store/dto/close-store.dto.ts

import { IsString, IsOptional, Length } from 'class-validator';

export class CloseStoreDto {
  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string;
}