import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class KeywordQueryDto {
  @ApiPropertyOptional({ example: '关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
