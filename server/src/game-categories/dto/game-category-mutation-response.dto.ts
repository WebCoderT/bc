import { ApiProperty } from '@nestjs/swagger';
import { GameCategoryResponseDto } from './game-category-response.dto';

export class GameCategoryMutationResponseDto {
  @ApiProperty({ example: '游戏分类更新成功' })
  message!: string;

  @ApiProperty({ type: GameCategoryResponseDto })
  category!: GameCategoryResponseDto;
}
