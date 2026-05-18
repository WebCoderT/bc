import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * 通用关键字查询 DTO，用于列表类接口的模糊搜索。
 */
export class KeywordQueryDto {
  @ApiPropertyOptional({ example: '关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
