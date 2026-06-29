import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Injectable()
export class PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: {
        module: 'asc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.permission.findUnique({
      where: {
        id,
      },
    });
  }

  async findByName(name: string) {
    return this.prisma.permission.findUnique({
      where: {
        name,
      },
    });
  }

  async create(dto: CreatePermissionDto) {
    return this.prisma.permission.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdatePermissionDto) {
    return this.prisma.permission.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async delete(id: string) {
    return this.prisma.permission.delete({
      where: {
        id,
      },
    });
  }

  async getByRoleId(roleId: string) {
    return this.prisma.rolePermission.findMany({
      where: {
        roleId,
      },
      include: {
        permission: true,
      },
    });
  }
}
