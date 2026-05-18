import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * 注册 DTO，约束新用户注册时的用户名和密码格式。
 */
export class RegisterDto {
  @ApiProperty({ example: 'new_user' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'username 仅支持字母、数字和下划线',
  })
  username: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  password: string;
}
