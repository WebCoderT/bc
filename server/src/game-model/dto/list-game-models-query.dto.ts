import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { KeywordPaginationQueryDto } from '../../common/dto/keyword-pagination-query.dto';
import { GameModelStatus } from '../enums/game-model-status.enum';

export class ListGameModelsQueryDto extends KeywordPaginationQueryDto {
  @ApiPropertyOptional({
    enum: GameModelStatus,
    example: GameModelStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(GameModelStatus)
  status?: GameModelStatus;
}
