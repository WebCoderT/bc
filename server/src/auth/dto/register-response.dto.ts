import { ApiProperty } from '@nestjs/swagger';
import { SafeUserDto } from '../../users/dto/safe-user.dto';

export class RegisterResponseDto {
  @ApiProperty({ example: '注册成功' })
  message!: string;

  @ApiProperty({ type: SafeUserDto })
  user!: SafeUserDto;
}
