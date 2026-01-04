import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';

import { PrismaUserRepository } from '@infrastructure/user/prisma-user.repository';
import { USER_REPOSITORY } from '@domain/user/user.tokens';
import { CreateUserForCenterUsecase } from '@application/user/create-benevole.usecase';
import { UserController } from '@presentation/user/dto/user.controller';

@Module({
  imports: [
    AuthModule, // ⭐ permet d’avoir PASSWORD_HASHER
  ],
  controllers: [UserController],
  providers: [
    CreateUserForCenterUsecase,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
