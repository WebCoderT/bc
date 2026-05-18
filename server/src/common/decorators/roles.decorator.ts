import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

/**
 * 角色元数据键，用于在路由处理器和控制器类上声明角色要求。
 */
export const ROLES_KEY = 'roles';

/**
 * 为路由或控制器声明允许访问的角色集合。
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
