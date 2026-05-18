import { ApiPropertyOptional } from '@nestjs/swagger';
import { KeywordPaginationQueryDto } from '../../common/dto/keyword-pagination-query.dto';

/**
 * 游戏列表查询 DTO，支持关键字与分页参数。
 */
export class ListGamesQueryDto extends KeywordPaginationQueryDto {
  @ApiPropertyOptional({ example: '星穹' })
  declare keyword?: string;
}
