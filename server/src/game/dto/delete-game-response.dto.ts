import { ApiProperty } from '@nestjs/swagger';

/**
 * 游戏删除成功后的响应 DTO。
 */
export class DeleteGameResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '游戏删除成功' })
  message!: string;
}
