import { PartialType } from '@nestjs/swagger';
import { CreateGameModelDto } from './create-game-model.dto';

export class UpdateGameModelDto extends PartialType(CreateGameModelDto) {}
