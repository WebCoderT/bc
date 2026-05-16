import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NavigatorService } from './navigator.service';
import { CreateNavigatorDto } from './dto/create-navigator.dto';
import { UpdateNavigatorDto } from './dto/update-navigator.dto';

@Controller('navigator')
export class NavigatorController {
  constructor(private readonly navigatorService: NavigatorService) {}

  @Post()
  create(@Body() createNavigatorDto: CreateNavigatorDto) {
    return this.navigatorService.create(createNavigatorDto);
  }

  @Get()
  findAll() {
    return this.navigatorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.navigatorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNavigatorDto: UpdateNavigatorDto) {
    return this.navigatorService.update(+id, updateNavigatorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.navigatorService.remove(+id);
  }
}
