import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth/auth.module';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import { CollecteModule } from '@modules/collecte/collecte.module';
import { ProductModule } from '@modules/product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CollecteModule,
    ProductModule,
  ],
})
export class AppModule {}
