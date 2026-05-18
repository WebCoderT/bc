import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NavigatorService } from './navigator.service';
import { CreateNavigatorDto } from './dto/create-navigator.dto';
import { UpdateNavigatorDto } from './dto/update-navigator.dto';

@Controller('navigator')
/**
 * 原始导航控制器负责提供基础导航 CRUD 接口。
 */
export class NavigatorController {
  /**
   * 注入导航服务，复用统一的导航增删改查逻辑。
   */
  constructor(private readonly navigatorService: NavigatorService) {}

  /**
   * 创建一条新的导航记录。
   */
  @Post()
  create(@Body() createNavigatorDto: CreateNavigatorDto) {
    return this.navigatorService.create(createNavigatorDto);
  }

  /**
   * 查询全部导航记录。
   */
  @Get()
  findAll() {
    return this.navigatorService.findAll();
  }

  /**
   * 根据导航 ID 查询单条详情。
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.navigatorService.findOne(+id);
  }

  /**
   * 根据导航 ID 更新指定导航。
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNavigatorDto: UpdateNavigatorDto,
  ) {
    return this.navigatorService.update(+id, updateNavigatorDto);
  }

  /**
   * 根据导航 ID 删除指定导航。
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.navigatorService.remove(+id);
  }
}
