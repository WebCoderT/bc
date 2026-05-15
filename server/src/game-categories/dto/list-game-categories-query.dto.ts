import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { GameCategoryStatus } from '../enums/game-category-status.enum';

function transformOptionalBoolean(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  return undefined;
}

export class ListGameCategoriesQueryDto {
  @ApiPropertyOptional({ example: '策略' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    enum: GameCategoryStatus,
    example: GameCategoryStatus.Enabled,
  })
  @IsOptional()
  @IsEnum(GameCategoryStatus)
  status?: GameCategoryStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => transformOptionalBoolean(value))
  isRecommended?: boolean;
}
