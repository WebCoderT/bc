import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
/**
 * 角色守卫负责根据 `Roles` 元数据校验当前用户是否具备访问权限。
 */
export class RolesGuard implements CanActivate {
  /**
   * 注入反射器，用于读取控制器和处理器上的角色元数据。
   */
  constructor(private readonly reflector: Reflector) {}

  /**
   * 校验当前请求用户是否满足接口所需角色。
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { role?: Role } | undefined;

    if (!user?.role) {
      throw new ForbiddenException('当前用户没有角色信息');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('当前角色无权访问该资源');
    }

    return true;
  }
}
