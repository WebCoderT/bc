import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { NavigationStatus } from '../enums/navigation-status.enum';
import { NavigationType } from '../enums/navigation-type.enum';

/**
 * 创建导航 DTO，约束导航新增时可提交的字段。
 */
export class CreateNavigatorDto {
  @ApiProperty({ example: '电子竞技' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name!: string;

  @ApiPropertyOptional({
    example: '/game/esports',
    description: '导航访问路径；不配置时，接口返回会自动回退为导航 id',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  path?: string;

  @ApiPropertyOptional({ example: '前台电子竞技业务导航入口' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: '🎮' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({
    enum: NavigationType,
    example: NavigationType.Top,
  })
  @IsEnum(NavigationType)
  type!: NavigationType;

  @ApiPropertyOptional({
    enum: NavigationStatus,
    example: NavigationStatus.Visible,
  })
  @IsOptional()
  @IsEnum(NavigationStatus)
  status?: NavigationStatus;

  @ApiPropertyOptional({ example: 10, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  sort?: number;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    example: 1,
    description: '所属一级导航 ID',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number | null;
}
