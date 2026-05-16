import { ApiProperty } from '@nestjs/swagger';
import { SafeUserDto } from '../../users/dto/safe-user.dto';

export class MemberDashboardDataDto {
  @ApiProperty({ type: SafeUserDto })
  user!: SafeUserDto;

  @ApiProperty({
    type: [String],
    example: ['查看个人资料', '浏览公开业务', '升级 VIP'],
  })
  abilities!: string[];
}
