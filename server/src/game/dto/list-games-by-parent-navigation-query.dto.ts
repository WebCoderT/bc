import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  PaginationQueryDto,
  transformOptionalNumber,
} from '../../common/dto/pagination-query.dto';

/**
 * 按父级导航分组查询游戏的双层分页 DTO。
 */
export class ListGamesByParentNavigationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: '组内游戏分页页码，对当前页的每个二级导航分组同时生效',
  })
  @Transform(({ value }) => transformOptionalNumber(value, 1))
  @IsOptional()
  @IsInt()
  @Min(1)
  gamePage?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: '组内游戏每页条数，对当前页的每个二级导航分组同时生效',
  })
  @Transform(({ value }) => transformOptionalNumber(value, 10))
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  gamePageSize?: number = 10;
}
