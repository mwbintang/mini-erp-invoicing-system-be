import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryAuditLogDto } from '../dto/query-audit-log.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AuditLogCreateInput) {
    return this.prisma.auditLog.create({
      data,
    });
  }

  async findAll(query: QueryAuditLogDto) {
    const {
      page = 1,
      limit = 10,
      entityType,
      entityId,
      action,
      userId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (action) where.action = action;
    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const orderBy: Prisma.AuditLogOrderByWithRelationInput = {
      [sortBy]: order,
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
