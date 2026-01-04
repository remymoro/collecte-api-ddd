// src/presentation/campaign/dto/update-campaign.dto.ts


import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCampaignDto {
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @Type(() => Date)
  @IsDate()
  gracePeriodEndDate: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  objectives?: string;
}
