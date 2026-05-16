import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { KeywordPaginationQueryDto } from '../../common/dto/keyword-pagination-query.dto';
import { Role } from '../../common/enums/role.enum';

export class ListAdminUsersQueryDto extends KeywordPaginationQueryDto {
  @ApiPropertyOptional({ enum: Role, example: Role.Admin })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
