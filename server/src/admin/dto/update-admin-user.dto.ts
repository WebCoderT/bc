import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsNumber, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../../common/enums/role.enum';

export class UpdateAdminUserDto {
  @ApiProperty({ example: 'admin_root' })
  @IsString()
  @MaxLength(20)
  username!: string;

  @ApiProperty({ enum: Role, example: Role.Admin })
  @IsEnum(Role)
  role!: Role;

  @ApiProperty({ example: 2000 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  rechargeAmount!: number;

  @ApiProperty({ example: 300 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  bonusAmount!: number;

  @ApiProperty({ example: '2026-05-14T08:30:00.000Z' })
  @IsISO8601()
  createdAt!: string;
}