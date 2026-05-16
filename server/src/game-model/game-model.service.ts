import { Injectable } from '@nestjs/common';
import { CreateGameModelDto } from './dto/create-game-model.dto';
import { UpdateGameModelDto } from './dto/update-game-model.dto';

@Injectable()
export class GameModelService {
  create(createGameModelDto: CreateGameModelDto) {
    return 'This action adds a new gameModel';
  }

  findAll() {
    return `This action returns all gameModel`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gameModel`;
  }

  update(id: number, updateGameModelDto: UpdateGameModelDto) {
    return `This action updates a #${id} gameModel`;
  }

  remove(id: number) {
    return `This action removes a #${id} gameModel`;
  }
}
