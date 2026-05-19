import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsObject,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { GameType } from '../enums/game-type.enum';
import { GameOddsMode } from '../enums/game-odds-mode.enum';

/**
 * 创建游戏 DTO，约束后台创建游戏时允许提交的字段。
 */
export class CreateGameDto {
  @ApiProperty({ description: '游戏名称', example: '星穹远征' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  label!: string;

  @ApiProperty({
    description: '游戏描述',
    example: '高沉浸叙事与多人协作玩法结合的太空冒险游戏。',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  description!: string;

  @ApiPropertyOptional({
    description: '游戏图标 URL',
    example: 'https://example.com/game-icon.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  iconUrl?: string;

  @ApiProperty({
    description: '游戏分类，表示游戏所属的左侧导航 ID',
    example: 1,
  })
  @IsInt()
  @Min(1)
  category!: number;

  @ApiProperty({
    description: '游戏模型 ID',
    example: '60',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  gameModelId!: string;

  @ApiProperty({
    description: '开奖间隔时间，单位秒',
    example: 60,
  })
  @IsInt()
  @Min(1)
  drawInterval!: number;

  @ApiPropertyOptional({
    description: '赔率模式，固定赔率或自定义赔付',
    enum: GameOddsMode,
    example: GameOddsMode.FIXED,
    default: GameOddsMode.FIXED,
  })
  @IsOptional()
  @IsEnum(GameOddsMode)
  oddsMode?: GameOddsMode;

  @ApiPropertyOptional({
    description: '固定赔率值，赔率模式为 fixed 时生效',
    example: 1.98,
  })
  @ValidateIf(
    (payload: CreateGameDto) => payload.oddsMode !== GameOddsMode.CUSTOM,
  )
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  fixedOdds?: number;

  @ApiPropertyOptional({
    description: '自定义赔付配置，当前仅预留字段',
    example: { formula: 'future-config' },
    type: 'object',
    additionalProperties: true,
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  customPayoutConfig?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: '游戏状态',
    enum: GameType,
    example: GameType.ONLINE,
    default: GameType.ONLINE,
  })
  @IsOptional()
  @IsEnum(GameType)
  status?: GameType;
}
