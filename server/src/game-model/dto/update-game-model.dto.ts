import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateGameModelDto } from './create-game-model.dto';

export class UpdateGameModelDto extends PartialType(
  OmitType(CreateGameModelDto, ['id'] as const),
) {}
