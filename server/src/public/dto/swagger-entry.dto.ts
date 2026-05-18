import { ApiProperty } from '@nestjs/swagger';

/**
 * Swagger 文档入口 DTO，描述不同角色文档地址。
 */
export class SwaggerEntryDto {
  @ApiProperty({ example: '/docs/public' })
  public!: string;

  @ApiProperty({ example: '/docs/member' })
  member!: string;

  @ApiProperty({ example: '/docs/admin' })
  admin!: string;
}
