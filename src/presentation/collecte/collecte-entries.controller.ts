import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { CreateEntryUseCase } from '../../application/collecte/create-entry.usecase';
import { EntryCreatedDto } from './dto/entry-created.dto';
import { CurrentUser } from '@presentation/auth/decorators/current-user.decorator';
import { CreateEntryFromStoreDto } from './dto/create-entry-from-store.dto';
import { JwtAuthGuard } from '@infrastructure/auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '@application/auth/authenticated-user.output';

@Controller('collecte-entries')
@UseGuards(JwtAuthGuard)
export class CollecteEntriesController {
  constructor(private readonly createEntryUseCase: CreateEntryUseCase) {}

  @Post()
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
}
