import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { AuthenticatedUser } from '@application/auth/authenticated-user.output';
import { JwtPayload } from '../jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

 async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
  return {
    userId: payload.sub,     // mapping JWT → app
    role: payload.role,
    centerId: payload.centerId,
  };
  }
}