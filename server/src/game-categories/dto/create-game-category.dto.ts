import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { GameCategoryStatus } from '../enums/game-category-status.enum';

export class CreateGameCategoryDto {
  @ApiProperty({ example: '卡牌策略' })
  @IsString()
  @MaxLength(50)
  name!: string;

  @ApiProperty({ example: '长线养成与对战策略玩法集合' })
  @IsString()
  @MaxLength(255)
  description!: string;

  @ApiPropertyOptional({ example: ['养成', '策略', '回合制'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isRecommended?: boolean;

  @ApiPropertyOptional({ example: 95, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  heat?: number;

  @ApiPropertyOptional({
    enum: GameCategoryStatus,
    example: GameCategoryStatus.Enabled,
  })
  @IsOptional()
  @IsEnum(GameCategoryStatus)
  status?: GameCategoryStatus;
}
