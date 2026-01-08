import { IsString } from 'class-validator';

export class CreateEntryFromStoreDto {
  @IsString()
  campaignId: string;

  @IsString()
  storeId: string;
}
