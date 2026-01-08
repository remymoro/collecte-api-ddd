// src/presentation/benevole/benevole.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/auth/guards/roles.guard';

import { CurrentUser } from '@presentation/auth/decorators/current-user.decorator';
import { Roles } from '@presentation/auth/decorators/roles.decorator';

import { AuthenticatedUser } from '@application/auth/authenticated-user.output';


import {
  GetAvailableStoresForBenevoleUseCase,
  GetAvailableStoresForBenevoleOutput,
} from '@application/benevole/get-available-stores-for-benevole.usecase';
import { CheckCampaignAcceptingEntriesForBenevoleUseCase, CheckCampaignAcceptingEntriesForBenevoleOutput } from '@application/campaign/check-active-campaign-for-benevole.usecase';

@Controller('benevole')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('BENEVOLE')
export class BenevoleController {
  constructor(
    private readonly checkCampaignAcceptingEntriesForBenevoleUseCase:
      CheckCampaignAcceptingEntriesForBenevoleUseCase,

    private readonly getAvailableStoresForBenevoleUseCase:
      GetAvailableStoresForBenevoleUseCase,
  ) {}

  /**
   * Vérifie si le bénévole peut encore saisir des données
   */
  @Get('check-access')
  async checkAccess(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CheckCampaignAcceptingEntriesForBenevoleOutput> {
    return this.checkCampaignAcceptingEntriesForBenevoleUseCase.execute({
      userId: user.userId,
    });
  }

  /**
   * Liste les magasins disponibles pour la saisie
   * pour le bénévole connecté.
   */
  @Get('available-stores')
  async getAvailableStores(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GetAvailableStoresForBenevoleOutput> {
    return this.getAvailableStoresForBenevoleUseCase.execute({
      userId: user.userId,
    });
  }
}
