import { Module } from '@nestjs/common';
import { ProductController } from '../../presentation/product/product.controller';
import { CreateProductUseCase } from '../../application/product/create-product.usecase';
import { UpdateProductUseCase } from '../../application/product/update-product.usecase';
import { PrismaProductRepository } from '../../infrastructure/product/prisma-product.repository';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module';
import { ListProductsUseCase } from '../../application/product/list-products.usecase';
import { ArchiveProductUseCase } from '../../application/product/archive-product.usecase';
@Module({
  imports: [
    PrismaModule, // fournit PrismaService
  ],
  controllers: [ProductController],
  providers: [
    CreateProductUseCase,
    UpdateProductUseCase,
    ListProductsUseCase,
    ArchiveProductUseCase,
    {
      provide: 'ProductRepository',
      useClass: PrismaProductRepository,
    },
  ],
  exports: [
    CreateProductUseCase,
    UpdateProductUseCase,
    ListProductsUseCase,
    ArchiveProductUseCase
  ],
})
export class ProductModule {}
