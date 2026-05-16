import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

function transformOptionalNumber(value: unknown, defaultValue?: number) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? defaultValue : parsedValue;
}

export class ListGamesQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @Transform(({ value }) => transformOptionalNumber(value, 1))
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @Transform(({ value }) => transformOptionalNumber(value, 10))
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional({ example: '星穹' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
