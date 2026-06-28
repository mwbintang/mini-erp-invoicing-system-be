import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    token: string,
    expiresAt: Date,
  ) {
    return this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findByToken(token: string) {
    return this.prisma.refreshToken.findUnique({
      where: {
        token,
      },
      include: {
        user: true,
      },
    });
  }

  async delete(token: string) {
    return this.prisma.refreshToken.deleteMany({
      where: {
        token,
      },
    });
  }
}