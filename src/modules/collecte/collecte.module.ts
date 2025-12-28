import { Module } from '@nestjs/common';
import { CollecteController } from '../../presentation/collecte/collecte.controller';
import { CreateEntryUseCase } from '../../application/collecte/create-entry.usecase';
import { ListEntriesUseCase } from '../../application/collecte/list-entries.usecase';
import { ValidateEntryUseCase } from '../../application/collecte/validate-entry.usecase';
import { GetEntryUseCase } from '../../application/collecte/get-entry.usecase';
import { AddItemUseCase } from '../../application/collecte/add-item.usecase';
import { RemoveItemUseCase } from '../../application/collecte/remove-item.usecase';
import { PrismaCollecteEntryRepository } from '../../infrastructure/collecte/prisma-collecte-entry.repository';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module';
import { PrismaProductRepository } from '../../infrastructure/product/prisma-product.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CollecteController],
  providers: [
    CreateEntryUseCase,
    ListEntriesUseCase,
    ValidateEntryUseCase,
    GetEntryUseCase,
    AddItemUseCase,
    RemoveItemUseCase,
    {
      provide: 'CollecteEntryRepository',
      useClass: PrismaCollecteEntryRepository,
    },
    {
      provide: 'ProductRepository',
      useClass: PrismaProductRepository,
    },
  ],
})
export class CollecteModule {}
