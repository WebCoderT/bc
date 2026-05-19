import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BetItemResponseDto {
  @ApiProperty({ description: '下注明细ID' })
  id!: number;

  @ApiProperty({ description: '下注顺序' })
  itemIndex!: number;

  @ApiProperty({ description: '玩法类型', example: 'p5-single-number' })
  betType!: string;

  @ApiProperty({ description: '展示文案', example: '1 2 3 4 5' })
  displayText!: string;

  @ApiProperty({ description: '下注金额', example: 10 })
  amount!: number;

  @ApiPropertyOptional({
    description: '预计派彩',
    example: 19.8,
    nullable: true,
  })
  estimatedPayout!: number | null;

  @ApiPropertyOptional({
    description: '预计盈利',
    example: 9.8,
    nullable: true,
  })
  estimatedProfit!: number | null;

  @ApiProperty({
    description: '下注结构化内容',
    example: { digits: [1, 2, 3, 4, 5], source: 'manual' },
  })
  selection!: Record<string, unknown>;

  @ApiPropertyOptional({
    description: '扩展附加信息',
    example: { source: 'manual' },
    nullable: true,
  })
  extraPayload!: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description: '是否中奖，未结算时为空',
    nullable: true,
  })
  isWinning!: boolean | null;

  @ApiProperty({
    description: '实际派彩金额',
    example: 19.8,
  })
  payoutAmount!: number;

  @ApiPropertyOptional({
    description: '结算时间，未结算时为空',
    nullable: true,
  })
  settledAt!: string | null;

  @ApiProperty({ description: '创建时间' })
  createdAt!: string;
}
