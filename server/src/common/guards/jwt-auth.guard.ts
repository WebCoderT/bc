import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
/**
 * JWT 守卫负责解析 Bearer Token、校验 JWT 并挂载当前用户信息。
 */
export class JwtAuthGuard implements CanActivate {
  /**
   * 注入 JWT 服务与用户服务，用于令牌解析和用户加载。
   */
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 校验当前请求是否携带有效令牌，并把安全用户对象挂载到 request.user。
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('缺少 Bearer Token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      request.user = this.usersService.toSafeUser(user);
      return true;
    } catch {
      throw new UnauthorizedException('Token 无效或已过期');
    }
  }

  /**
   * 从 Authorization 请求头中提取 Bearer Token。
   */
  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
