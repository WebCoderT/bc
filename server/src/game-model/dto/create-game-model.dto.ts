import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { GameModelStatus } from '../enums/game-model-status.enum';

export class CreateGameModelDto {
  @ApiProperty({ description: '模型名称', example: '默认模型' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: '模型描述', example: '这是一个默认的游戏模型。' })
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  description!: string;

  @ApiProperty({ description: '模型版本', example: '1.0.0' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  version!: string;

  @ApiPropertyOptional({
    description: '模型状态',
    enum: GameModelStatus,
    example: GameModelStatus.ACTIVE,
    default: GameModelStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(GameModelStatus)
  status?: GameModelStatus;

  @ApiPropertyOptional({ description: '开奖间隔时间(秒)', example: 60 })
  @IsOptional()
  @IsInt()
  @Min(1)
  drawInterval?: number;
}
