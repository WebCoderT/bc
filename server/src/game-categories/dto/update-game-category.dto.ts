import { PartialType } from '@nestjs/swagger';
import { CreateGameCategoryDto } from './create-game-category.dto';

export class UpdateGameCategoryDto extends PartialType(CreateGameCategoryDto) {}
