import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? 'default_jwt_secret',
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException();
    }
    return {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  }
}
