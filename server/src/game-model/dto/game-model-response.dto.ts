import { ApiProperty } from '@nestjs/swagger';
import { GameModelStatus } from '../enums/game-model-status.enum';

export class GameModelResponseDto {
  @ApiProperty({ example: '60' })
  id!: string;

  @ApiProperty({ example: '默认模型' })
  name!: string;

  @ApiProperty({ example: '这是一个默认的游戏模型。' })
  description!: string;

  @ApiProperty({ example: '1.0.0' })
  version!: string;

  @ApiProperty({ enum: GameModelStatus, example: GameModelStatus.ACTIVE })
  status!: GameModelStatus;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2024-01-02T00:00:00.000Z' })
  updatedAt!: string;
}
