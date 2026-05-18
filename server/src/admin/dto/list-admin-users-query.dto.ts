import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { KeywordPaginationQueryDto } from '../../common/dto/keyword-pagination-query.dto';
import { Role } from '../../common/enums/role.enum';

/**
 * 管理员用户列表查询 DTO，支持角色筛选、关键字和分页参数。
 */
export class ListAdminUsersQueryDto extends KeywordPaginationQueryDto {
  @ApiPropertyOptional({ enum: Role, example: Role.Admin })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
