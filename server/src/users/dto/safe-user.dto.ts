import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

/**
 * 安全用户 DTO，剔除密码等敏感字段后对外返回。
 */
export class SafeUserDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'admin_root' })
  username!: string;

  @ApiProperty({ example: 'data:image/svg+xml;utf8,...' })
  avatar!: string;

  @ApiProperty({ enum: Role, example: Role.Admin })
  role!: Role;

  @ApiProperty({ example: 2000 })
  rechargeAmount!: number;

  @ApiProperty({ example: 300 })
  bonusAmount!: number;

  @ApiProperty({ example: 2300 })
  totalBalance!: number;

  @ApiProperty({ example: '2026-05-14T08:30:00.000Z' })
  createdAt!: string;
}
