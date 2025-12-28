import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '@application/auth/token-service';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(private readonly jwt: JwtService) {}

  async sign(payload: Record<string, unknown>): Promise<string> {
    return this.jwt.signAsync(payload);
  }
}
