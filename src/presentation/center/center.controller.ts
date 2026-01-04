import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { ReactivateCenterUseCase } from '@application/center/reactivate-center.usecase';
import { CreateCenterUsecase } from '@application/center/create-center.usecase';
import { DeactivateCenterUseCase } from '@application/center/deactivate-center.usecase';
import { GetCenterUseCase } from '@application/center/get-center.usecase';
import { ListCentersUseCase } from '@application/center/list-centers.usecase';
import { UpdateCenterUseCase } from '@application/center/update-center.usecase';
import { JwtAuthGuard } from '@infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/auth/guards/roles.guard';
import { Roles } from '@presentation/auth/decorators/roles.decorator';
import { CreateCenterDto } from './dto/create-center.dto';
import { UpdateCenterDto } from './dto/update-center.dto';

@Controller('centers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CenterController {
  constructor(
    private readonly createCenter: CreateCenterUsecase,
    private readonly getCenter: GetCenterUseCase,
    private readonly listCenters: ListCentersUseCase,
    private readonly updateCenter: UpdateCenterUseCase,
    private readonly deactivateCenter: DeactivateCenterUseCase,
    private readonly reactivateCenter: ReactivateCenterUseCase,
  ) {}

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCenterDto) {
    const center = await this.createCenter.execute(dto);

    return {
      id: center.id,
      name: center.name,
      address: center.address,
      city: center.city,
      postalCode: center.postalCode,
      isActive: center.isActive,
    };
  }

  @Get()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async list() {
    const centers = await this.listCenters.execute();

    return centers.map((center) => ({
      id: center.id,
      name: center.name,
      address: center.address,
      city: center.city,
      postalCode: center.postalCode,
      isActive: center.isActive,
    }));
  }

  @Get(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('id') id: string) {
    const center = await this.getCenter.execute(id);

    return {
      id: center.id,
      name: center.name,
      address: center.address,
      city: center.city,
      postalCode: center.postalCode,
      isActive: center.isActive,
    };
  }

  @Put(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateCenterDto) {
    const center = await this.updateCenter.execute({
      centerId: id,
      ...dto,
    });

    return {
      id: center.id,
      name: center.name,
      address: center.address,
      city: center.city,
      postalCode: center.postalCode,
      isActive: center.isActive,
    };
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id') id: string) {
    const center = await this.deactivateCenter.execute(id);

    return {
      id: center.id,
      name: center.name,
      address: center.address,
      city: center.city,
      postalCode: center.postalCode,
      isActive: center.isActive,
    };
  }

  @Patch(':id/activate')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async activate(@Param('id') id: string) {
    const center = await this.reactivateCenter.execute(id);

    return {
      id: center.id,
      name: center.name,
      address: center.address,
      city: center.city,
      postalCode: center.postalCode,
      isActive: center.isActive,
    };
  }
}
