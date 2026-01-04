import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/auth/guards/roles.guard';
import { Roles } from '@presentation/auth/decorators/roles.decorator';
import { CreateUserForCenterUsecase } from '@application/user/create-benevole.usecase';
import { CreateUserDto } from './create-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly createUserForCenter: CreateUserForCenterUsecase,
  ) {}

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto) {
    const user = await this.createUserForCenter.execute(dto);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      centerId: user.centerId,
    };
  }
}
