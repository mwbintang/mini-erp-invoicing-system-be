import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

import { UserRepository } from '../../users/repositories/user.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { StringValue } from 'ms';
import ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = this.buildPayload(user);

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    const refreshExpiresAt = this.getRefreshTokenExpiryDate();

    await this.refreshTokenRepository.create(
      user.id,
      refreshToken,
      refreshExpiresAt,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<string>(
        'jwt.accessExpiresIn',
      ),
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const storedToken =
      await this.refreshTokenRepository.findByToken(
        dto.refreshToken,
      );

    if (!storedToken) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    if (storedToken.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException(
        'Refresh token expired',
      );
    }

    // Rotate refresh token
    await this.refreshTokenRepository.delete(
      dto.refreshToken,
    );

    const payload = this.buildPayload(storedToken.user);

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    await this.refreshTokenRepository.create(
      storedToken.user.id,
      refreshToken,
      this.getRefreshTokenExpiryDate(),
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<string>(
        'jwt.accessExpiresIn',
      ),
    };
  }

  async logout(refreshToken: string) {
    await this.refreshTokenRepository.delete(refreshToken);

    return {
      message: 'Logout successful',
    };
  }

  async me(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }

  private buildPayload(user: {
    id: string;
    email: string;
    roleId: string;
  }) {
    return {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
    };
  }

  private generateAccessToken(payload: object) {
    return this.jwtService.signAsync(
      payload,
      {
        secret: this.configService.getOrThrow<string>(
          'jwt.accessSecret',
        ),
        expiresIn: this.configService.getOrThrow<StringValue>(
          'jwt.accessExpiresIn',
        ),
      }
    );
  }

  private generateRefreshToken(payload: object) {
    return this.jwtService.signAsync(payload,
      {
        secret: this.configService.getOrThrow<string>(
          'jwt.refreshSecret',
        ),
        expiresIn: this.configService.getOrThrow<StringValue>(
          'jwt.refreshExpiresIn',
        ),
      }
    );
  }

  private getRefreshTokenExpiryDate(): Date {
    const expiresIn =
      this.configService.getOrThrow<StringValue>(
        'jwt.refreshExpiresIn',
      );

    return new Date(Date.now() + ms(expiresIn));
  }
}