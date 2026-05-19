import { ApiProperty } from '@nestjs/swagger';
import { GameDrawRuntimeStatus } from '../enums/game-draw-runtime-status.enum';

export class GameCurrentIssueResponseDto {
  @ApiProperty({ example: 101 })
  gameId!: number;

  @ApiProperty({ example: '2026051900002', required: false, nullable: true })
  currentIssue!: string | null;

  @ApiProperty({
    example: '2026-05-19T08:01:00.000Z',
    required: false,
    nullable: true,
  })
  lastDrawAt!: string | null;

  @ApiProperty({ example: '2026-05-19T08:02:00.000Z' })
  nextDrawAt!: string;

  @ApiProperty({ example: 60 })
  drawInterval!: number;

  @ApiProperty({
    enum: GameDrawRuntimeStatus,
    example: GameDrawRuntimeStatus.Idle,
  })
  status!: GameDrawRuntimeStatus;
}
