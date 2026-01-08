// src/presentation/campaign/campaign.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { CreateCampaignUseCase } from
  '@application/campaign/create-campaign.usecase';
import { UpdateCampaignUseCase } from
  '@application/campaign/update-campaign.usecase';
import { CloseCampaignUseCase } from
  '@application/campaign/close-campaign.usecase';
import { GetCampaignUseCase } from
  '@application/campaign/get-campaign.usecase';
import { GetCurrentCampaignUseCase } from
  '@application/campaign/get-current-campaign.usecase';
import { ListCampaignsUseCase } from
  '@application/campaign/list-campaigns.usecase';

import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignResponseDto } from './dto/campaign-response.dto';


import { CurrentUser } from '@presentation/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '@application/auth/authenticated-user.output';
import { JwtAuthGuard } from '@infrastructure/auth/guards/jwt-auth.guard';



@UseGuards(JwtAuthGuard)
@Controller('campaigns')
export class CampaignController {
  constructor(
    private readonly createCampaign: CreateCampaignUseCase,
    private readonly updateCampaign: UpdateCampaignUseCase,
    private readonly closeCampaign: CloseCampaignUseCase,
    private readonly getCampaign: GetCampaignUseCase,
    private readonly getCurrentCampaign: GetCurrentCampaignUseCase,
    private readonly listCampaigns: ListCampaignsUseCase,
  ) {}

  // =========================
  // CREATE
  // =========================
 @Post()
async create(
  @Body() dto: CreateCampaignDto,
  @CurrentUser() user: AuthenticatedUser
): Promise<CampaignResponseDto> {

  const campaign = await this.createCampaign.execute({
    ...dto,
    createdBy: user.userId, // ✅ calculé côté serveur
  });

  return CampaignController.toResponseDto(campaign);
}
  // =========================
  // UPDATE
  // =========================
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ): Promise<CampaignResponseDto> {
    const campaign = await this.updateCampaign.execute({
      ...dto,
      campaignId: id,
    });

    return CampaignController.toResponseDto(campaign);
  }

  // =========================
  // CLOSE
  // =========================
  @Post(':id/close')
  async close(
    @Param('id') id: string,
    @Body('closedBy') closedBy: string,
  ): Promise<CampaignResponseDto> {
    const campaign = await this.closeCampaign.execute({
      campaignId: id,
      closedBy,
    });

    return CampaignController.toResponseDto(campaign);
  }

  // =========================
  // GET BY ID
  // =========================
  @Get(':id')
  async getById(
    @Param('id') id: string,
  ): Promise<CampaignResponseDto> {
    const { campaign } = await this.getCampaign.execute({
      campaignId: id,
    });

    return CampaignController.toResponseDto(campaign);
  }

  // =========================
  // GET CURRENT
  // =========================
  @Get('current')
  async getCurrent(): Promise<CampaignResponseDto | null> {
    const campaign = await this.getCurrentCampaign.execute();

    return campaign
      ? CampaignController.toResponseDto(campaign)
      : null;
  }

  // =========================
  // LIST
  // =========================
  @Get()
  async list(): Promise<CampaignResponseDto[]> {
    const campaigns = await this.listCampaigns.execute({});
    return campaigns.map(CampaignController.toResponseDto);
  }

  // =========================
  // MAPPING
  // =========================
  private static toResponseDto(
    campaign: any,
  ): CampaignResponseDto {
    return {
      id: campaign.id.toString(),
      name: campaign.name,
      year: campaign.year,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      gracePeriodEndDate: campaign.gracePeriodEndDate,
      status: campaign.status,
      description: campaign.description,
      objectives: campaign.objectives,
      createdAt: campaign.createdAt,
      closedBy: campaign.closedBy,
      closedAt: campaign.closedAt,
    };
  }
}
