import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { BetOrderStatus } from '../enums/bet-order-status.enum';

export class QueryBetsDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 10;

  @ApiPropertyOptional({ description: '游戏 ID 过滤', example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  gameId?: number;

  @ApiPropertyOptional({
    description: '用户 ID 过滤，仅管理端使用',
    example: 8,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;

  @ApiPropertyOptional({
    description: '注单状态过滤',
    enum: BetOrderStatus,
    example: BetOrderStatus.PLACED,
  })
  @IsOptional()
  @IsEnum(BetOrderStatus)
  status?: BetOrderStatus;

  @ApiPropertyOptional({
    description: '关键字，支持期号、游戏名称、用户名、选号文案模糊搜索',
    example: '12345',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  keyword?: string;
}
