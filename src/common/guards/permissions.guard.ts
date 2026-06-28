import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { PERMISSION_KEY } from '../decorators/permissions.decorator';
import { PermissionRepository } from '../../authorization/repositories/permission.repository';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ) {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(
        PERMISSION_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest();

    const user = request.user;

    const permissions =
      await this.permissionRepository.getByRoleId(
        user.roleId,
      );

    const names = permissions.map(
      (permission) => permission.permission.name,
    );

    const allowed = requiredPermissions.every(
      (permission) =>
        names.includes(permission),
    );

    if (!allowed) {
      throw new ForbiddenException(
        'Permission denied',
      );
    }

    return true;
  }
}