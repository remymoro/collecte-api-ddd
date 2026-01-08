import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/auth/guards/roles.guard';
import { Roles } from '@presentation/auth/decorators/roles.decorator';
import { CurrentUser } from '@presentation/auth/decorators/current-user.decorator';

import { AuthenticatedUser } from '@application/auth/authenticated-user.output';
import { StoreStatus } from '@domain/store/enums/store-status.enum';

// ============================
// USE CASES
// ============================

import { CreateStoreUseCase } from '@application/store/create-store.usecase';
import { GetStoreUseCase } from '@application/store/get-store.usecase';
import { ListStoresUseCase } from '@application/store/list-stores.usecase';
import { UpdateStoreUseCase } from '@application/store/update-store.usecase';
import { MarkStoreAvailableUseCase, MarkStoreUnavailableUseCase } from '@application/store/mark-store-unavailable.usecase';
import { CloseStoreUseCase } from '@application/store/close-store.usecase';

import { GenerateStoreImageUploadTokenUseCase } from '@application/store/generate-store-image-upload-token.usecase';
import { AddStoreImageUseCase } from '@application/store/add-store-image.usecase';
import { RemoveStoreImageUseCase } from '@application/store/remove-store-image.usecase';
import { SetPrimaryStoreImageUseCase } from '@application/store/set-primary-store-image.usecase';

// ============================
// DTOs
// ============================

import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { MarkStoreUnavailableDto } from './dto/mark-store-unavailable.dto';
import { CloseStoreDto } from './dto/close-store.dto';

import { GenerateUploadTokenDto } from './dto/generate-upload-token.dto';
import { AddStoreImageDto } from './dto/add-store-image.dto';
import { RemoveStoreImageDto } from './dto/remove-store-image.dto';
import { SetPrimaryImageDto } from './dto/set-primary-image.dto';

import { StoreViewDto } from './dto/store-view.dto';
import { StoreDetailDto } from './dto/store-detail.dto';
import { StoreCreatedDto } from './dto/store-created.dto';
import { Store } from '@domain/store/store.entity';
import { StoreImage } from '@domain/store/value-objects/store-image.vo';

@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StoreController {
  constructor(
    private readonly createStore: CreateStoreUseCase,
    private readonly getStore: GetStoreUseCase,
    private readonly listStores: ListStoresUseCase,
    private readonly updateStore: UpdateStoreUseCase,
    private readonly markUnavailable: MarkStoreUnavailableUseCase,
    private readonly markAvailable: MarkStoreAvailableUseCase,
    private readonly closeStore: CloseStoreUseCase,
    private readonly generateUploadToken: GenerateStoreImageUploadTokenUseCase,
    private readonly addImage: AddStoreImageUseCase,
    private readonly removeImage: RemoveStoreImageUseCase,
    private readonly setPrimaryImage: SetPrimaryStoreImageUseCase,
  ) {}

  // ============================
  // STORES
  // ============================

  @Post()
  @Roles('ADMIN')
  async create(@Body() dto: CreateStoreDto): Promise<StoreCreatedDto> {
    const store = await this.createStore.execute(dto);
    return this.toDetailDto(store);
  }

  @Get()
  @Roles('ADMIN', 'BENEVOLE')
  async list(
    @Query('centerId') centerId?: string,
    @Query('city') city?: string,
    @Query('status') status?: StoreStatus,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<StoreViewDto[]> {
    const effectiveCenterId =
      user?.role === 'BENEVOLE' ? user.centerId : centerId;

    const stores = await this.listStores.execute({
      centerId: effectiveCenterId,
      city,
      status,
    });

    return stores.map(this.toViewDto);
  }

  @Get(':id')
  @Roles('ADMIN', 'BENEVOLE')
  async get(@Param('id') id: string): Promise<StoreDetailDto> {
    const store = await this.getStore.execute({ storeId: id });
    return this.toDetailDto(store);
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStoreDto,
  ): Promise<StoreDetailDto> {
    const store = await this.updateStore.execute({ storeId: id, ...dto });
    return this.toDetailDto(store);
  }

  // ============================
  // STATUS
  // ============================

  @Patch(':id/unavailable')
  @Roles('ADMIN')
  async unavailable(
    @Param('id') id: string,
    @Body() dto: MarkStoreUnavailableDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StoreDetailDto> {
    const store = await this.markUnavailable.execute({
      storeId: id,
      userId: user.userId,
      reason: dto.reason,
    });

    return this.toDetailDto(store);
  }

  @Patch(':id/available')
  @Roles('ADMIN')
  async available(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StoreDetailDto> {
    const store = await this.markAvailable.execute({
      storeId: id,
      userId: user.userId,
    });

    return this.toDetailDto(store);
  }

 @Patch(':id/close')
@Roles('ADMIN')
async close(
  @Param('id') id: string,
  @Body() dto: CloseStoreDto,
  @CurrentUser() user: AuthenticatedUser,
): Promise<StoreDetailDto> {
  const store = await this.closeStore.execute({
    storeId: id,
    userId: user.userId, // ✅ CORRECT
    reason: dto.reason ?? 'Fermeture définitive',
  });

  return this.toDetailDto(store);
}


  // ============================
  // IMAGES
  // ============================

  @Post(':id/images/upload-token')
  @Roles('ADMIN')
  generateUpload(
    @Param('id') id: string,
    @Body() dto: GenerateUploadTokenDto,
  ) {
    return this.generateUploadToken.execute({
      storeId: id,
      fileSize: dto.fileSize,
      mimeType: dto.mimeType,
    });
  }

  @Post(':id/images')
  @Roles('ADMIN')
  async addStoreImage(
    @Param('id') id: string,
    @Body() dto: AddStoreImageDto,
  ) {
    const store = await this.addImage.execute({
      storeId: id,
      imageUrl: dto.url,
      isPrimary: dto.isPrimary,
    });

    return this.toImagesDto(store);
  }

  @Delete(':id/images')
  @Roles('ADMIN')
  async deleteImage(
    @Param('id') id: string,
    @Body() dto: RemoveStoreImageDto,
  ) {
    const store = await this.removeImage.execute({
      storeId: id,
      imageUrl: dto.url,
    });

    return this.toImagesDto(store);
  }

  @Patch(':id/images/primary')
  @Roles('ADMIN')
  async setPrimary(
    @Param('id') id: string,
    @Body() dto: SetPrimaryImageDto,
  ) {
    const store = await this.setPrimaryImage.execute({
      storeId: id,
      imageUrl: dto.url,
    });

    return this.toImagesDto(store);
  }

  // ============================
  // MAPPERS (PRIVATE)
  // ============================

 private toViewDto(store: Store): StoreViewDto {
  return {
    id: store.id.toString(),
    centerId: store.centerId.toString(),
    name: store.name,
    city: store.city,
    postalCode: store.postalCode,
    status: store.status,
    phone: store.phone,
    contactName: store.contactName,

    // 👇 IMAGE PRINCIPALE UNIQUEMENT
    primaryImageUrl: store.primaryImage?.url,
  };
}
  private toDetailDto(store: any): StoreDetailDto {
    return {
      ...this.toViewDto(store),
      address: store.address,
      statusChangedAt: store.statusChangedAt,
      statusChangedBy: store.statusChangedBy,
      statusReason: store.statusReason,
    };
  }

 private toImagesDto(store: Store) {
  return {
    id: store.id.toString(),
    images: store.images.map((img: StoreImage) => ({
      url: img.url,
      isPrimary: img.isPrimary,
    })),
  };
}

}
