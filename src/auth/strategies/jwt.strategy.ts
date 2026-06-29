import {
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PassportStrategy } from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        configService.getOrThrow('jwt.accessSecret'),
    });
  }

  async validate(payload: { sub: string; email: string; roleId: string }) {
    return {
      id: payload.sub,
      email: payload.email,
      roleId: payload.roleId,
    };
  }
}
