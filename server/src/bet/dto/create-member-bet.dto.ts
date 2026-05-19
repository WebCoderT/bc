import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateMemberBetItemDto {
  @ApiProperty({ description: '注单展示文案', example: '1 2 3 4 5' })
  @IsString()
  @MaxLength(255)
  displayText!: string;

  @ApiProperty({
    description: '下注类型，便于兼容不同游戏玩法',
    example: 'p5-single-number',
  })
  @IsString()
  @MaxLength(100)
  betType!: string;

  @ApiProperty({ description: '单注金额', example: 10 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @ApiProperty({
    description: '下注内容，按游戏模型自由扩展',
    example: { digits: [1, 2, 3, 4, 5], source: 'manual' },
  })
  @IsObject()
  selection!: Record<string, unknown>;

  @ApiPropertyOptional({
    description: '扩展附加信息，供不同游戏玩法预留',
    example: { source: 'manual' },
  })
  @IsOptional()
  @IsObject()
  extraPayload?: Record<string, unknown>;
}

export class CreateMemberBetDto {
  @ApiPropertyOptional({ description: '下注目标期号', example: '20260519001' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  issueNo?: string;

  @ApiProperty({
    description: '下注条目列表，不同游戏通过 betType + selection 兼容',
    type: [CreateMemberBetItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateMemberBetItemDto)
  items!: CreateMemberBetItemDto[];
}
