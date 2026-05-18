import { ApiProperty } from '@nestjs/swagger';
import { GameType } from '../enums/game-type.enum';

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

  @ApiProperty({ example: '2026-05-16T06:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-16T08:00:00.000Z' })
  updatedAt!: string;
}
