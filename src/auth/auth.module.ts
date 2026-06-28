import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UsersModule } from '../users/users.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { PermissionRepository } from '../authorization/repositories/permission.repository';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
    }),
    AuthorizationModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenRepository,
    PermissionRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}