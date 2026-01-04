import { Module } from '@nestjs/common';

import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';

import { CampaignModule } from '@modules/campaign/campaign.module';
import { StoreModule } from '@modules/store/store.module';

import { CAMPAIGN_STORE_AUTHORIZATION_REPOSITORY } from '@domain/campaign-store-authorization/campaign-store-authorization.tokens';

import { AuthorizeStoreForCampaignUseCase } from '@application/campaign-store-authorization/authorize-store-for-campaign.usecase';
import { DeactivateStoreForCampaignUseCase } from '@application/campaign-store-authorization/deactivate-store-for-campaign.usecase';
import { ListAuthorizedStoresForCampaignUseCase } from '@application/campaign-store-authorization/list-authorized-stores-for-campaign.usecase';
import { GetAuthorizationForStoreUseCase } from '@application/campaign-store-authorization/get-authorization-for-store.usecase';
import { ListStoresForCenterCampaignUseCase } from '@application/campaign-store-authorization/list-stores-for-center-campaign.usecase';

import { CampaignStoreAuthorizationController } from '@presentation/campaign-store-authorization/campaign-store-authorization.controller';
import { CampaignCenterStoreAuthorizationController } from '@presentation/campaign-store-authorization/campaign-center-store-authorization.controller';

import { PrismaCampaignStoreAuthorizationRepository } from '@infrastructure/campaign-store-authorization/prisma-campaign-store-authorization.repository';

@Module({
  imports: [PrismaModule, CampaignModule, StoreModule],
  controllers: [
    CampaignStoreAuthorizationController,
    CampaignCenterStoreAuthorizationController,
  ],
  providers: [
    {
      provide: CAMPAIGN_STORE_AUTHORIZATION_REPOSITORY,
      useClass: PrismaCampaignStoreAuthorizationRepository,
    },
    AuthorizeStoreForCampaignUseCase,
    DeactivateStoreForCampaignUseCase,
    ListAuthorizedStoresForCampaignUseCase,
    GetAuthorizationForStoreUseCase,
    ListStoresForCenterCampaignUseCase,
  ],
  exports: [
    CAMPAIGN_STORE_AUTHORIZATION_REPOSITORY,
    ListAuthorizedStoresForCampaignUseCase,
    GetAuthorizationForStoreUseCase,
  ],
})
export class CampaignStoreAuthorizationModule {}
