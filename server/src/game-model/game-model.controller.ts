import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GameModelService } from './game-model.service';
import { CreateGameModelDto } from './dto/create-game-model.dto';
import { UpdateGameModelDto } from './dto/update-game-model.dto';

@Controller('game-model')
export class GameModelController {
  constructor(private readonly gameModelService: GameModelService) {}

  @Post()
  create(@Body() createGameModelDto: CreateGameModelDto) {
    return this.gameModelService.create(createGameModelDto);
  }

  @Get()
  findAll() {
    return this.gameModelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameModelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameModelDto: UpdateGameModelDto) {
    return this.gameModelService.update(+id, updateGameModelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gameModelService.remove(+id);
  }
}
