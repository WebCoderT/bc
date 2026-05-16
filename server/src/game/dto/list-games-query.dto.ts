import { ApiPropertyOptional } from '@nestjs/swagger';
import { KeywordPaginationQueryDto } from '../../common/dto/keyword-pagination-query.dto';

export class ListGamesQueryDto extends KeywordPaginationQueryDto {
  @ApiPropertyOptional({ example: '星穹' })
  declare keyword?: string;
}
