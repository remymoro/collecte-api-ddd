import { IsIn, IsOptional } from 'class-validator';
import type { CampaignStoreAuthorizationStatus } from '@domain/campaign-store-authorization/campaign-store-authorization.entity';

export class ListAuthorizationsQueryDto {
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: CampaignStoreAuthorizationStatus;
}
