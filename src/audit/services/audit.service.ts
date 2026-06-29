import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { AuditRepository } from '../repositories/audit.repository';
import { QueryAuditLogDto } from '../dto/query-audit-log.dto';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async log(data: {
    userId?: string;
    entityType: string;
    entityId: string;
    action: AuditAction;
    oldValue?: any;
    newValue?: any;
  }) {
    return this.auditRepository.create({
      entityType: data.entityType,
      entityId: data.entityId,
      action: data.action,
      oldValue: data.oldValue ? data.oldValue : undefined,
      newValue: data.newValue ? data.newValue : undefined,
      user: data.userId ? { connect: { id: data.userId } } : undefined,
    });
  }

  async findAll(query: QueryAuditLogDto) {
    return this.auditRepository.findAll(query);
  }

  async findOne(id: string) {
    const log = await this.auditRepository.findById(id);
    if (!log) throw new NotFoundException(`Audit log ${id} not found`);
    return log;
  }
}
