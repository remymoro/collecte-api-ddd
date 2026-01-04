import { IsUUID } from 'class-validator';

export class AuthorizeStoreForCampaignDto {
  @IsUUID()
  campaignId: string;

  @IsUUID()
  storeId: string;
}
