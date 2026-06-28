import { Module, Global } from '@nestjs/common';
import { PermissionRepository } from './repositories/permission.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [PermissionRepository],
  exports: [PermissionRepository],
})
export class AuthorizationModule {}
