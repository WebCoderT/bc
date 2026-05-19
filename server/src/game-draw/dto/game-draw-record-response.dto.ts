import { ApiProperty } from '@nestjs/swagger';
import { GameDrawRecordStatus } from '../enums/game-draw-record-status.enum';
import { GameDrawSourceType } from '../enums/game-draw-source-type.enum';

export class GameDrawRecordResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '2026051900001' })
  issueNo!: string;

  @ApiProperty({ example: '1,4,7,2,9' })
  openCode!: string;

  @ApiProperty({ example: [1, 4, 7, 2, 9] })
  openCodeJson!: unknown;

  @ApiProperty({ example: { sum: 23, span: 8 } })
  resultPayload!: Record<string, unknown> | null;

  @ApiProperty({ example: '2026-05-19T08:00:00.000Z' })
  drawTime!: string;

  @ApiProperty({
    enum: GameDrawRecordStatus,
    example: GameDrawRecordStatus.Open,
  })
  drawStatus!: GameDrawRecordStatus;

  @ApiProperty({ enum: GameDrawSourceType, example: GameDrawSourceType.System })
  sourceType!: GameDrawSourceType;

  @ApiProperty({ example: 'p5-v1' })
  algorithmVersion!: string;

  @ApiProperty({ example: '2026-05-19T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-19T08:00:00.000Z' })
  updatedAt!: string;
}
