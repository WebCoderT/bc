import { ApiProperty } from '@nestjs/swagger';
import { GameResponseDto } from './game-response.dto';

/**
 * 游戏创建或更新后的统一响应 DTO。
 */
export class GameMutationResponseDto {
  @ApiProperty({ example: '游戏创建成功' })
  message!: string;

  @ApiProperty({ type: GameResponseDto })
  game!: GameResponseDto;
}
