import { ApiProperty } from '@nestjs/swagger';
import { SafeUserDto } from '../../users/dto/safe-user.dto';

/**
 * VIP 洞察数据 DTO，描述用户及其可见的专属报告列表。
 */
export class VipInsightsDataDto {
  @ApiProperty({ type: SafeUserDto })
  user!: SafeUserDto;

  @ApiProperty({
    type: [String],
    example: ['高阶概率分析报告', '优先实验功能', '专属数据看板'],
  })
  reports!: string[];
}
