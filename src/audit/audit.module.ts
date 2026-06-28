import { Module, Global } from '@nestjs/common';
import { AuditService } from './services/audit.service';
import { AuditRepository } from './repositories/audit.repository';
import { AuditController } from './controllers/audit.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthorizationModule } from '../authorization/authorization.module';

@Global()
@Module({
  imports: [PrismaModule, AuthorizationModule],
  controllers: [AuditController],
  providers: [AuditService, AuditRepository],
  exports: [AuditService],
})
export class AuditModule {}
