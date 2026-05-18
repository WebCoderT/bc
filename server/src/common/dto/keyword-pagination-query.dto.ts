import { IntersectionType } from '@nestjs/swagger';
import { KeywordQueryDto } from './keyword-query.dto';
import { PaginationQueryDto } from './pagination-query.dto';

/**
 * 关键字与分页组合查询 DTO，复用分页和关键字两个基础查询结构。
 */
export class KeywordPaginationQueryDto extends IntersectionType(
  PaginationQueryDto,
  KeywordQueryDto,
) {}
