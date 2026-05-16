import { ApiProperty } from '@nestjs/swagger';
import { GameResponseDto } from './game-response.dto';

export class GameMutationResponseDto {
  @ApiProperty({ example: '游戏创建成功' })
  message!: string;

  @ApiProperty({ type: GameResponseDto })
  game!: GameResponseDto;
}
