import { ApiProperty } from '@nestjs/swagger';

export class DeleteGameCategoryResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '游戏分类删除成功' })
  message!: string;
}
