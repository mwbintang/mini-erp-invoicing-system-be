import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

import { AuthService } from '../services/auth.service';

import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'Successful login' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  login(
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  refresh(
    @Body()
    dto: RefreshTokenDto,
  ) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({ status: 200, description: 'Successful logout' })
  logout(
    @Body()
    dto: RefreshTokenDto,
  ) {
    return this.authService.logout(
      dto.refreshToken,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
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
