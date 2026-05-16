import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { KeywordQueryDto } from '../../common/dto/keyword-query.dto';
import { NavigationStatus } from '../enums/navigation-status.enum';
import { NavigationType } from '../enums/navigation-type.enum';

function transformOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) ? parsedValue : undefined;
}

export class ListNavigationsQueryDto extends KeywordQueryDto {
  @ApiPropertyOptional({
    enum: NavigationType,
    example: NavigationType.Top,
    description: '按导航类型筛选',
  })
  @IsOptional()
  @IsEnum(NavigationType)
  type?: NavigationType;

  @ApiPropertyOptional({
    enum: NavigationStatus,
    example: NavigationStatus.Visible,
    description: '按导航状态筛选',
  })
  @IsOptional()
  @IsEnum(NavigationStatus)
  status?: NavigationStatus;

  @ApiPropertyOptional({ example: 1, description: '按父级导航筛选' })
  @IsOptional()
  @Transform(({ value }) => transformOptionalNumber(value))
  @IsInt()
  @Min(1)
  parentId?: number;
}
