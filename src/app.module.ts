import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth/auth.module';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import { CollecteModule } from '@modules/collecte/collecte.module';
import { ProductModule } from '@modules/product/product.module';
import { CampaignModule } from '@modules/campaign/campaign.module';
import { CampaignStoreAuthorizationModule } from '@modules/campaign-store-authorization/campaign-store-authorization.module';
import { CenterModule } from '@modules/center/center.module';
import { StoreModule } from '@modules/store/store.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    CenterModule,
    StoreModule,
    CampaignModule,
    CampaignStoreAuthorizationModule,
    CollecteModule,
    ProductModule,
  ],
})
export class AppModule {}
