import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

/**
 * 登录 DTO，承载用户名和密码。
 */
export class LoginDto {
  @ApiProperty({ example: 'admin_root' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  password: string;
}
