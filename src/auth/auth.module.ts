import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UsersModule } from '../users/users.module';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('jwt.accessSecret'),
      }),
    }),
    AuthorizationModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}
