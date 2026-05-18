import { ApiProperty } from '@nestjs/swagger';

/**
 * 仅返回标识符的数据结构，常用于删除成功等简单响应。
 */
export class IdDataDto {
  @ApiProperty({ example: '1' })
  id!: string | number;
}
