import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BetOrderStatus } from '../enums/bet-order-status.enum';
import { BetItemResponseDto } from './bet-item-response.dto';

export class BetOrderUserSummaryDto {
  @ApiProperty({ description: '用户ID' })
  id!: number;

  @ApiProperty({ description: '用户名' })
  username!: string;
}

export class BetOrderResponseDto {
  @ApiProperty({ description: '注单ID' })
  id!: number;

  @ApiProperty({ description: '游戏ID' })
  gameId!: number;

  @ApiProperty({ description: '游戏名称快照' })
  gameLabel!: string;

  @ApiProperty({ description: '下注策略标识', example: 'p5' })
  betStrategyKey!: string;

  @ApiPropertyOptional({ description: '期号', nullable: true })
  issueNo!: string | null;

  @ApiProperty({ enum: BetOrderStatus, description: '注单状态' })
  status!: string;

  @ApiProperty({ description: '总金额' })
  totalAmount!: number;

  @ApiProperty({ description: '下注条数' })
  itemCount!: number;

  @ApiPropertyOptional({ description: '预计总派彩', nullable: true })
  estimatedPayout!: number | null;

  @ApiPropertyOptional({ description: '预计总盈利', nullable: true })
  estimatedProfit!: number | null;

  @ApiProperty({ description: '赔率快照文案' })
  oddsSummary!: string;

  @ApiProperty({ description: '投注摘要' })
  selectionSummary!: string;

  @ApiProperty({ description: '下注时间' })
  placedAt!: string;

  @ApiProperty({ type: [BetItemResponseDto], description: '下注明细列表' })
  items!: BetItemResponseDto[];

  @ApiPropertyOptional({
    type: BetOrderUserSummaryDto,
    description: '后台管理时返回下注用户摘要',
    nullable: true,
  })
  user?: BetOrderUserSummaryDto;
}
