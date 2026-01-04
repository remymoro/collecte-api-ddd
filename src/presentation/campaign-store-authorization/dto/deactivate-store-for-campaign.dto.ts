import { IsUUID } from 'class-validator';

export class DeactivateStoreForCampaignDto {
  @IsUUID()
  campaignId: string;

  @IsUUID()
  storeId: string;
}
