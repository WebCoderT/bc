import { ApiProperty } from '@nestjs/swagger';
import { SafeUserDto } from '../../users/dto/safe-user.dto';

/**
 * 用户资料响应 DTO，用于令牌校验后的个人信息返回。
 */
export class ProfileResponseDto {
  @ApiProperty({ example: 'JWT 校验通过' })
  message!: string;

  @ApiProperty({ type: SafeUserDto })
  user!: SafeUserDto;
}
