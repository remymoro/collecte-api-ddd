import { CampaignStatus } from
  '@domain/campaign/enums/campaign-status.enum';

export class CampaignResponseDto {
  id: string;
  name: string;
  year: number;
  startDate: Date;
  endDate: Date;
  gracePeriodEndDate: Date;
  status: CampaignStatus;
  description?: string;
  objectives?: string;
  createdAt: Date;
  closedBy?: string;
  closedAt?: Date;
}
