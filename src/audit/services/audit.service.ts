import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    userId?: string;
    entityType: string;
    entityId: string;
    action: AuditAction;
    oldValue?: any;
    newValue?: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        oldValue: data.oldValue ? data.oldValue : undefined,
        newValue: data.newValue ? data.newValue : undefined,
      },
    });
  }
}
