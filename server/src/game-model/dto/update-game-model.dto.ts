import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateGameModelDto } from './create-game-model.dto';

/**
 * 更新游戏模型 DTO，禁止修改模型主键编号。
 */
export class UpdateGameModelDto extends PartialType(
  OmitType(CreateGameModelDto, ['id'] as const),
) {}
