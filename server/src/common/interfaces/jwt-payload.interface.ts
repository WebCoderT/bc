import { Role } from '../enums/role.enum';

/**
 * JWT 负载结构，定义令牌中需要携带的用户基础身份信息。
 */
export interface JwtPayload {
  sub: number;
  username: string;
  role: Role;
}
