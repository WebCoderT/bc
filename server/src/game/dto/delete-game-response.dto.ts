import { ApiProperty } from '@nestjs/swagger';

export class DeleteGameResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '游戏删除成功' })
  message!: string;
}
