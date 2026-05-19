import { ApiProperty } from '@nestjs/swagger';
import { GameType } from '../enums/game-type.enum';
import { GameOddsMode } from '../enums/game-odds-mode.enum';

/**
 * 游戏响应 DTO，定义游戏对外返回字段。
 */
export class GameResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '星穹远征' })
  label!: string;

  @ApiProperty({ example: '高沉浸叙事与多人协作玩法结合的太空冒险游戏。' })
  description!: string;

  @ApiProperty({ example: 'https://example.com/game-icon.png' })
  iconUrl!: string;

  @ApiProperty({ example: 1, description: '所属左侧导航 ID' })
  category!: number;

  @ApiProperty({ example: '60', description: '关联游戏模型 ID' })
  gameModelId!: string;

  @ApiProperty({ enum: GameType, example: GameType.ONLINE })
  status!: GameType;

  @ApiProperty({ example: 60, description: '开奖间隔时间，单位秒' })
  drawInterval!: number;

  @ApiProperty({
    enum: GameOddsMode,
    example: GameOddsMode.FIXED,
    description: '赔率模式',
  })
  oddsMode!: GameOddsMode;

  @ApiProperty({
    example: 1.98,
    description: '固定赔率值，若为自定义赔付则为空',
    nullable: true,
  })
  fixedOdds!: number | null;

  @ApiProperty({
    example: { formula: 'future-config' },
    description: '自定义赔付配置，当前仅预留字段',
    nullable: true,
  })
  customPayoutConfig!: Record<string, unknown> | null;

  @ApiProperty({ example: '2026-05-16T06:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-16T08:00:00.000Z' })
  updatedAt!: string;
}
