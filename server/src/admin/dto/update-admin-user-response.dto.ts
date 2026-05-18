import { ApiProperty } from '@nestjs/swagger';
import { SafeUserDto } from '../../users/dto/safe-user.dto';

/**
 * 管理员更新用户成功后的响应 DTO。
 */
export class UpdateAdminUserResponseDto {
  @ApiProperty({ example: '用户信息更新成功' })
  message!: string;

  @ApiProperty({ type: SafeUserDto })
  user!: SafeUserDto;
}
