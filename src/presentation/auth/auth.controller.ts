import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { AuthenticateUserUsecase } from '@application/auth/authenticate-user.usecase';
import { TokenService } from '@application/auth/token-service';
import { TOKEN_SERVICE } from '@application/auth/auth.tokens';
import { JwtAuthGuard } from '@infrastructure/auth/guards/jwt-auth.guard';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(
    private readonly authenticateUser: AuthenticateUserUsecase,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}


  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authenticateUser.execute(body);

    const token = await this.tokenService.sign({
      sub: user.id,
      role: user.role,
      activeCenterId: user.activeCenterId,
    });

    return { accessToken: token };
  }
}
