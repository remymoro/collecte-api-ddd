// src/presentation/store/dto/update-store.dto.ts

import { IsString, IsOptional, Length, Matches } from 'class-validator';

export class UpdateStoreDto {
  @IsString()
  @Length(1, 200)
  name: string;

  @IsString()
  @Length(1, 300)
  address: string;

  @IsString()
  @Length(1, 100)
  city: string;

  @IsString()
  @Matches(/^\d{5}$/, { message: 'postalCode must be a valid 5-digit postal code' })
  postalCode: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9\s\-\+\.()]+$/, { message: 'phone must be a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  contactName?: string;
}