import { ApiProperty } from '@nestjs/swagger';
import { GameCategoryResponseDto } from './game-category-response.dto';

export class GameCategoryListResponseDto {
  @ApiProperty({ type: [GameCategoryResponseDto] })
  items!: GameCategoryResponseDto[];

  @ApiProperty({ example: 4 })
  total!: number;
}
