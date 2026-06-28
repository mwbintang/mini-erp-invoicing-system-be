import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from '../services/audit.service';
import { QueryAuditLogDto } from '../dto/query-audit-log.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('audit-logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Permissions('AUDIT_LOG_READ')
  @ApiOperation({ summary: 'Get all audit logs' })
  findAll(@Query() query: QueryAuditLogDto) {
    return this.auditService.findAll(query);
  }

  @Get(':id')
  @Permissions('AUDIT_LOG_READ')
  @ApiOperation({ summary: 'Get an audit log by id' })
  findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }
}
