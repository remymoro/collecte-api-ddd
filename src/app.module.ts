import { Module } from '@nestjs/common';
import { CollecteModule } from './modules/collecte/collecte.module';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { ProductModule } from './modules/product/product.module';

@Module({
  imports: [CollecteModule, PrismaModule, ProductModule],
})
export class AppModule {}
