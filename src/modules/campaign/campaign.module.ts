import { Module } from '@nestjs/common';

import { PrismaModule } from
  '@infrastructure/persistence/prisma/prisma.module';

import { CAMPAIGN_REPOSITORY } from
  '@domain/campaign/campaign.tokens';

import { PrismaCampaignRepository } from
  '@infrastructure/campaign/prisma-campaign.repository';

import { CampaignController } from
  '@presentation/campaign/campaign.controller';

import { CreateCampaignUseCase } from
  '@application/campaign/create-campaign.usecase';

import { GetCampaignUseCase } from
  '@application/campaign/get-campaign.usecase';

import { GetCurrentCampaignUseCase } from
  '@application/campaign/get-current-campaign.usecase';

import { ListCampaignsUseCase } from
  '@application/campaign/list-campaigns.usecase';

import { UpdateCampaignUseCase } from
  '@application/campaign/update-campaign.usecase';

import { CloseCampaignUseCase } from
  '@application/campaign/close-campaign.usecase';


import { BenevoleController } from
  '@presentation/benevole/benevole.controller';

import { UserModule } from
  '@modules/user/user.module';
import { CheckCampaignAcceptingEntriesForBenevoleUseCase } from '@application/campaign/check-active-campaign-for-benevole.usecase';
import { GetAvailableStoresForBenevoleUseCase } from '@application/benevole/get-available-stores-for-benevole.usecase';
import { STORE_REPOSITORY } from '@domain/store/store.tokens';
import { PrismaStoreRepository } from '@infrastructure/store/prisma-store.repository';
import { USER_REPOSITORY } from '@domain/user/user.tokens';
import { PrismaUserRepository } from '@infrastructure/user/prisma-user.repository';

const useCases = [
  CreateCampaignUseCase,
  GetCampaignUseCase,
  ListCampaignsUseCase,
  GetCurrentCampaignUseCase,
  UpdateCampaignUseCase,
  CloseCampaignUseCase,
  CheckCampaignAcceptingEntriesForBenevoleUseCase,
  GetAvailableStoresForBenevoleUseCase
];

@Module({
  imports: [
    PrismaModule,
    UserModule,
  ],
  controllers: [
    CampaignController,
    BenevoleController,
  ],
  providers: [
    {
      provide: CAMPAIGN_REPOSITORY,
      useClass: PrismaCampaignRepository,
    },
   {
     provide: STORE_REPOSITORY,
     useClass: PrismaStoreRepository,
   }
    ,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },



    ...useCases,
  ],
  exports: [
    CAMPAIGN_REPOSITORY,
    ...useCases,
  ],
})
export class CampaignModule {}
