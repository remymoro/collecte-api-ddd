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
import { CurrentUser } from '../auth/current-user.decorator';
import { CurrentUserPayload, FakeAuthGuard } from '../auth/fake-auth.guard';
import { AddEntryItemDto } from './dto/add-entry-item.dto';
import { EntryViewDto } from './dto/entry-view.dto';

@Controller('collecte')
@UseGuards(FakeAuthGuard)
export class CollecteController {
  constructor(
    private readonly createEntryUseCase: CreateEntryUseCase,
    private readonly listEntriesUseCase: ListEntriesUseCase,
    private readonly validateEntryUseCase: ValidateEntryUseCase,
    private readonly getEntryUseCase: GetEntryUseCase,
    private readonly addItemUseCase: AddItemUseCase,
    private readonly removeItemUseCase: RemoveItemUseCase,
  ) {}

  @Post('entries')
  async createEntry(
    @CurrentUser() currentUser: CurrentUserPayload | undefined,
  ) {
    void currentUser;
    const entry = await this.createEntryUseCase.execute();

    return {
      id: entry.id,
      totalWeightKg: entry.totalWeightKg,
      status: entry.entryStatus,
    };
  }

  @Post('entries/:id/validate')
  async validateEntry(
    @CurrentUser() currentUser: CurrentUserPayload | undefined,
    @Param('id') id: string,
  ) {
    void currentUser;

    await this.validateEntryUseCase.execute(id);

    const entry = await this.getEntryUseCase.execute(id);

    return {
      status: entry.entryStatus,
      totalWeightKg: entry.totalWeightKg,
      validatedAt: entry.validatedAt,
    };
  }

  @Get('entries/:id')
  async getEntryById(
    @Param('id') id: string,
  ): Promise<{
    id: string;
    status: string;
    items: Array<{
      productRef: string;
      family: string;
      subFamily?: string;
      weightKg: number;
    }>;
    totalWeightKg: number;
  }> {
    const entry = await this.getEntryUseCase.execute(id);

    return {
      id: entry.id,
      status: entry.entryStatus,
      items: entry.entryItems.map((item) => ({
        productRef: item.productRef,
        family: item.family,
        subFamily: item.subFamily,
        weightKg: item.weightKg,
      })),
      totalWeightKg: entry.totalWeightKg,
    };
  }

  @Patch('entries/:id/items')
  async addItemToEntry(
    @Param('id') id: string,
    @Body() dto: AddEntryItemDto,
  ): Promise<{ status: string; totalWeightKg: number }> {
    const entry = await this.addItemUseCase.execute(id, {
      productRef: dto.productRef,
      weightKg: dto.weightKg,
    });

    return { status: entry.entryStatus, totalWeightKg: entry.totalWeightKg };
  }

  @Delete('entries/:id/items/:index')
  async removeItemFromEntry(
    @Param('id') id: string,
    @Param('index') index: string,
  ): Promise<{ status: string; totalWeightKg: number }> {
    const entry = await this.removeItemUseCase.execute(id, Number(index));

    return { status: entry.entryStatus, totalWeightKg: entry.totalWeightKg };
  }

  @Get('entries')
  async listEntries(
    @CurrentUser() currentUser: CurrentUserPayload | undefined,
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
