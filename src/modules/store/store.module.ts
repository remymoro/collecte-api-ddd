// src/modules/store/store.module.ts

import { Module } from '@nestjs/common';
import { GetStoreUseCase } from '@application/store/get-store.usecase';
import { CreateStoreUseCase } from '@application/store/create-store.usecase';
import { ListStoresUseCase } from '@application/store/list-stores.usecase';
import { MarkStoreAvailableUseCase, MarkStoreUnavailableUseCase } from '@application/store/mark-store-unavailable.usecase';
import { UpdateStoreUseCase } from '@application/store/update-store.usecase';
import { CloseStoreUseCase } from '@application/store/close-store.usecase';
import { GenerateStoreImageUploadTokenUseCase } from '@application/store/generate-store-image-upload-token.usecase';
import { AddStoreImageUseCase } from '@application/store/add-store-image.usecase';
import { RemoveStoreImageUseCase } from '@application/store/remove-store-image.usecase';
import { SetPrimaryStoreImageUseCase } from '@application/store/set-primary-store-image.usecase';
import { STORE_REPOSITORY } from '@domain/store/store.tokens';
import { PrismaStoreRepository } from '@infrastructure/store/prisma-store.repository';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import { StoreController } from '@presentation/store/store.controller';
import { AzureBlobService } from '@infrastructure/storage/azure-blob.service';
import { AZURE_BLOB_SERVICE } from '@infrastructure/storage/storage.tokens';
import { CenterModule } from '@modules/center/center.module';

const useCases = [
  CreateStoreUseCase,
  GetStoreUseCase,
  ListStoresUseCase,
  UpdateStoreUseCase,
  MarkStoreUnavailableUseCase,
  MarkStoreAvailableUseCase,
  CloseStoreUseCase,
  GenerateStoreImageUploadTokenUseCase,
  AddStoreImageUseCase,
  RemoveStoreImageUseCase,
  SetPrimaryStoreImageUseCase,
];

@Module({
  imports: [PrismaModule, CenterModule],
  controllers: [StoreController],
  providers: [
    {
      provide: STORE_REPOSITORY,
      useClass: PrismaStoreRepository,
    },
    {
      provide: AZURE_BLOB_SERVICE,
      useClass: AzureBlobService,
    },
    ...useCases,
  ],
  exports: [STORE_REPOSITORY, ...useCases],
})
export class StoreModule {}
