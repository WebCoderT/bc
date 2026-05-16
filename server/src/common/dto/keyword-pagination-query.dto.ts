import { IntersectionType } from '@nestjs/swagger';
import { KeywordQueryDto } from './keyword-query.dto';
import { PaginationQueryDto } from './pagination-query.dto';

export class KeywordPaginationQueryDto extends IntersectionType(
  PaginationQueryDto,
  KeywordQueryDto,
) {}
