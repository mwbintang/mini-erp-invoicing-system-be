import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards
} from '@nestjs/common';

import { AuthService } from '../services/auth.service';

import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('login')
  login(
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(
    @Body()
    dto: RefreshTokenDto,
  ) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  logout(
    @Body()
    dto: RefreshTokenDto,
  ) {
    return this.authService.logout(
      dto.refreshToken,
    );
  }

  @Get('me')
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
  )
  @Permissions('USER_READ')
  getProfile(
    @CurrentUser() user: any,
  ) {
    return user;
  }
}