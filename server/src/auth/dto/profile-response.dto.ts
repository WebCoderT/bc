import { ApiProperty } from '@nestjs/swagger';
import { SafeUserDto } from '../../users/dto/safe-user.dto';

export class ProfileResponseDto {
  @ApiProperty({ example: 'JWT 校验通过' })
  message!: string;

  @ApiProperty({ type: SafeUserDto })
  user!: SafeUserDto;
}
