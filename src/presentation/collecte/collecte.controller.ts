import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateEntryUseCase } from '../../application/collecte/create-entry.usecase';
import { ListEntriesUseCase } from '../../application/collecte/list-entries.usecase';
import { ValidateEntryUseCase } from '../../application/collecte/validate-entry.usecase';
import { GetEntryUseCase } from '../../application/collecte/get-entry.usecase';
import { AddItemUseCase } from '../../application/collecte/add-item.usecase';
import { RemoveItemUseCase } from '../../application/collecte/remove-item.usecase';
import { AddEntryItemDto } from './dto/add-entry-item.dto';
import { EntryViewDto } from './dto/entry-view.dto';
import { EntryCreatedDto } from './dto/entry-created.dto';
import { EntryValidatedDto } from './dto/entry-validated.dto';
import { EntryDetailDto } from './dto/entry-detail.dto';
import { EntryItemAddedDto } from './dto/entry-item-added.dto';
import { EntryItemRemovedDto } from './dto/entry-item-removed.dto';
import { CurrentUser } from '@presentation/auth/decorators/current-user.decorator';
import { CreateEntryFromStoreDto } from './dto/create-entry-from-store.dto';
import { JwtAuthGuard } from '@infrastructure/auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '@application/auth/authenticated-user.output';


@Controller('collecte-entries')
@UseGuards(JwtAuthGuard)
export class CollecteController {
  constructor(
    private readonly createEntryUseCase: CreateEntryUseCase,
    private readonly listEntriesUseCase: ListEntriesUseCase,
    private readonly validateEntryUseCase: ValidateEntryUseCase,
    private readonly getEntryUseCase: GetEntryUseCase,
    private readonly addItemUseCase: AddItemUseCase,
    private readonly removeItemUseCase: RemoveItemUseCase,
  ) {}

  @Post('')
  async createEntry(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() body: CreateEntryFromStoreDto,
  ): Promise<EntryCreatedDto> {
    const userId = currentUser.userId;
    const centerId = currentUser.centerId;

    if (!centerId) {
      throw new Error('Invariant violated: missing centerId in JWT payload');
    }

    const entry = await this.createEntryUseCase.execute({
      campaignId: body.campaignId,
      storeId: body.storeId,
      centerId,
      userId,
    });
    return {
      id: entry.id.toString(),
      totalWeightKg: entry.totalWeightKg,
      status: entry.status,
    };
  }

  @Post('entries/:id/validate')
  async validateEntry(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<EntryValidatedDto> {
    void currentUser;

    await this.validateEntryUseCase.execute(id);

    const entry = await this.getEntryUseCase.execute(id);

    const validatedAt = entry.validatedAt;

    if (!validatedAt) {
      throw new Error('Invariant violated: validated entry has no validatedAt');
    }

    return {
      status: entry.status,
      totalWeightKg: entry.totalWeightKg,
      validatedAt,
    };
  }

  @Get('entries/:id')
  async getEntryById(
    @Param('id') id: string,
  ): Promise<EntryDetailDto> {
    const entry = await this.getEntryUseCase.execute(id);

    return {
      id: entry.id.toString(),
      status: entry.status,
      items: entry.itemsSnapshot.map((item) => ({
        productRef: item.productRef,
        family: item.family,
        subFamily: item.subFamily,
        weightKg: item.weightKg,
      })),
      totalWeightKg: entry.totalWeightKg,
      createdAt: entry.createdAt,
      validatedAt: entry.validatedAt,
    };
  }

  @Patch('entries/:id/items')
  async addItemToEntry(
    @Param('id') id: string,
    @Body() dto: AddEntryItemDto,
  ): Promise<EntryItemAddedDto> {
    const entry = await this.addItemUseCase.execute(id, {
      productRef: dto.productRef,
      weightKg: dto.weightKg,
    });

    return { status: entry.status, totalWeightKg: entry.totalWeightKg };
  }

  @Delete('entries/:id/items/:index')
  async removeItemFromEntry(
    @Param('id') id: string,
    @Param('index') index: string,
  ): Promise<EntryItemRemovedDto> {
    const entry = await this.removeItemUseCase.execute(id, Number(index));

    return { status: entry.status, totalWeightKg: entry.totalWeightKg };
  }

  @Get('entries')
  async listEntries(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<EntryViewDto[]> {
    void currentUser;
    const views = await this.listEntriesUseCase.execute();

    return views.map((view) => ({
      totalWeightKg: view.totalWeightKg,
      status: view.status,
      createdAt: view.createdAt,
    }));
  }
}
