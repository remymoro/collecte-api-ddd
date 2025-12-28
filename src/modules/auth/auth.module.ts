import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';

import { AuthController } from '@presentation/auth/auth.controller';
import { AuthenticateUserUsecase } from '@application/auth/authenticate-user.usecase';
import { JwtTokenService } from '@infrastructure/auth/jwt-token.service';
import { BcryptPasswordHasher } from '@infrastructure/auth/bcrypt-password-hasher';
import {
  TOKEN_SERVICE,
  PASSWORD_HASHER,
} from '@application/auth/auth.tokens';
import { PrismaUserRepository } from '@infrastructure/user/prisma-user.repository';
import { USER_REPOSITORY } from '@domain/user/user.tokens';
import { JwtStrategy } from '@infrastructure/auth/strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
      },
    }),
  ],
  controllers: [AuthController],
 providers: [
  AuthenticateUserUsecase,
  JwtStrategy,
  {
    provide: USER_REPOSITORY,
    useClass: PrismaUserRepository,
  },
  {
    provide: TOKEN_SERVICE,
    useClass: JwtTokenService,
  },
  {
    provide: PASSWORD_HASHER,
    useClass: BcryptPasswordHasher,
  },
],

  
})
export class AuthModule {}
