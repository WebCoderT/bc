import { PartialType } from '@nestjs/swagger';
import { CreateGameDto } from './create-game.dto';

/**
 * 更新游戏 DTO，允许对创建游戏字段进行部分更新。
 */
export class UpdateGameDto extends PartialType(CreateGameDto) {}
