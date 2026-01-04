import { Module } from '@nestjs/common';
import { ActivateCenterUseCase } from '@application/center/activate-center.usecase';
import { ReactivateCenterUseCase } from '@application/center/reactivate-center.usecase';
import { CreateCenterUsecase } from '@application/center/create-center.usecase';
import { DeactivateCenterUseCase } from '@application/center/deactivate-center.usecase';
import { GetCenterUseCase } from '@application/center/get-center.usecase';
import { ListCentersUseCase } from '@application/center/list-centers.usecase';
import { UpdateCenterUseCase } from '@application/center/update-center.usecase';
import { CenterController } from '@presentation/center/center.controller';
import { PrismaCenterRepository } from '@infrastructure/center/prisma-center.repository';
import { CENTER_REPOSITORY } from '@domain/center/center.tokens';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CenterController],
  providers: [
    {
      provide: CENTER_REPOSITORY,
      useClass: PrismaCenterRepository,
    },
    CreateCenterUsecase,
    GetCenterUseCase,
    ListCentersUseCase,
    UpdateCenterUseCase,
    DeactivateCenterUseCase,
    ActivateCenterUseCase,
    ReactivateCenterUseCase,
  ],
  exports: [CENTER_REPOSITORY],
})
export class CenterModule {}
