// src/presentation/store/dto/mark-store-unavailable.dto.ts

import { IsString, Length } from 'class-validator';

export class MarkStoreUnavailableDto {
  @IsString()
  @Length(1, 500)
  reason: string;
}