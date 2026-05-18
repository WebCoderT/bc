import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { KeywordPaginationQueryDto } from '../../common/dto/keyword-pagination-query.dto';
import { GameModelStatus } from '../enums/game-model-status.enum';

/**
 * 游戏模型列表查询 DTO，支持关键字、状态和分页筛选。
 */
export class ListGameModelsQueryDto extends KeywordPaginationQueryDto {
  @ApiPropertyOptional({
    enum: GameModelStatus,
    example: GameModelStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(GameModelStatus)
  status?: GameModelStatus;
}
