import { ApiProperty } from '@nestjs/swagger';

export class GameResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '星穹远征' })
  label!: string;

  @ApiProperty({ example: '高沉浸叙事与多人协作玩法结合的太空冒险游戏。' })
  description!: string;

  @ApiProperty({ example: 'https://example.com/game-icon.png' })
  iconUrl!: string;

  @ApiProperty({ example: '2026-05-16T06:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-16T08:00:00.000Z' })
  updatedAt!: string;
}
