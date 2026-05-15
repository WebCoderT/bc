import { ApiProperty } from '@nestjs/swagger';
import { GameCategoryStatus } from '../enums/game-category-status.enum';

export class GameCategoryResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '卡牌策略' })
  name!: string;

  @ApiProperty({ example: '长线养成与对战策略玩法集合' })
  description!: string;

  @ApiProperty({ type: [String], example: ['养成', '策略', '回合制'] })
  tags!: string[];

  @ApiProperty({ example: true })
  isRecommended!: boolean;

  @ApiProperty({ example: 95 })
  heat!: number;

  @ApiProperty({
    enum: GameCategoryStatus,
    example: GameCategoryStatus.Enabled,
  })
  status!: GameCategoryStatus;

  @ApiProperty({ example: 12 })
  gameCount!: number;

  @ApiProperty({ example: '2026-05-15T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-15T08:30:00.000Z' })
  updatedAt!: string;
}
