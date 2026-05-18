import { ApiProperty } from '@nestjs/swagger';
import { SafeUserDto } from '../../users/dto/safe-user.dto';

/**
 * 会员中心面板 DTO，描述当前用户和可用能力列表。
 */
export class MemberDashboardDataDto {
  @ApiProperty({ type: SafeUserDto })
  user!: SafeUserDto;

  @ApiProperty({
    type: [String],
    example: ['查看个人资料', '浏览公开业务', '升级 VIP'],
  })
  abilities!: string[];
}
