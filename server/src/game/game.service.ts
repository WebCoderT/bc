import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { createPaginatedResult } from '../common/utils/pagination.util';
import { CreateGameDto } from './dto/create-game.dto';
import { ListGamesQueryDto } from './dto/list-games-query.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { GameType } from './enums/game-type.enum';
import { NavigationEntity } from '../navigator/entities/navigator.entity';
import { NavigationType } from '../navigator/enums/navigation-type.enum';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(NavigationEntity)
    private readonly navigationRepository: Repository<NavigationEntity>,
  ) { }

  async create(createGameDto: CreateGameDto) {
    const normalizedInput = this.normalizeInput(createGameDto);
    await this.ensureCategoryIsValid(normalizedInput.category);
    const existingGame = await this.gameRepository.findOne({
      where: { label: normalizedInput.label },
    });

    if (existingGame) {
      throw new ConflictException('游戏名称已存在');
    }

    const game = this.gameRepository.create(normalizedInput);
    const savedGame = await this.gameRepository.save(game);

    return this.toGameResponse(savedGame);
  }

  async findAll(query?: ListGamesQueryDto) {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 10;
    const keyword = query?.keyword?.trim();

    const where = keyword
      ? [{ label: Like(`%${keyword}%`) }, { description: Like(`%${keyword}%`) }]
      : undefined;

    const [games, total] = await this.gameRepository.findAndCount({
      where,
      order: { updatedAt: 'DESC', id: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return createPaginatedResult(
      games.map((game) => this.toGameResponse(game)),
      total,
      page,
      pageSize,
    );
  }

  async findOne(id: number) {
    const game = await this.gameRepository.findOne({ where: { id } });

    if (!game) {
      throw new NotFoundException('游戏不存在');
    }

    return this.toGameResponse(game);
  }

  async update(id: number, updateGameDto: UpdateGameDto) {
    const game = await this.gameRepository.findOne({ where: { id } });

    if (!game) {
      throw new NotFoundException('游戏不存在');
    }

    const normalizedInput = this.normalizeInput(updateGameDto, game);
    await this.ensureCategoryIsValid(normalizedInput.category);

    if (normalizedInput.label !== game.label) {
      const existingGame = await this.gameRepository.findOne({
        where: { label: normalizedInput.label },
      });

      if (existingGame && existingGame.id !== id) {
        throw new ConflictException('游戏名称已存在');
      }
    }

    Object.assign(game, normalizedInput);
    const savedGame = await this.gameRepository.save(game);

    return this.toGameResponse(savedGame);
  }

  async remove(id: number) {
    const game = await this.gameRepository.findOne({ where: { id } });

    if (!game) {
      throw new NotFoundException('游戏不存在');
    }

    await this.gameRepository.remove(game);

    return {
      id,
      message: '游戏删除成功',
    };
  }

  private normalizeInput(
    input: Partial<CreateGameDto>,
    fallback?: Partial<Game>,
  ) {
    return {
      label: input.label?.trim() || fallback?.label || '',
      description: input.description?.trim() || fallback?.description || '',
      iconUrl: input.iconUrl?.trim() || fallback?.iconUrl || '',
      category:
        typeof input.category === 'number'
          ? input.category
          : Number(fallback?.category ?? 0),
      status: input.status || fallback?.status || GameType.ONLINE,
    };
  }

  private async ensureCategoryIsValid(categoryId: number) {
    if (!Number.isInteger(categoryId) || categoryId < 1) {
      throw new BadRequestException('游戏分类不能为空');
    }

    const navigation = await this.navigationRepository.findOne({
      where: { id: categoryId },
    });

    if (!navigation) {
      throw new NotFoundException('游戏分类对应的导航不存在');
    }

    if (navigation.type !== NavigationType.Side) {
      throw new BadRequestException('游戏分类必须选择侧边导航');
    }
  }

  private toGameResponse(game: Game) {
    return {
      id: game.id,
      label: game.label,
      description: game.description,
      iconUrl: game.iconUrl || '',
      category: Number(game.category ?? 0),
      status: game.status,
      createdAt:
        game.createdAt instanceof Date
          ? game.createdAt.toISOString()
          : new Date(game.createdAt).toISOString(),
      updatedAt:
        game.updatedAt instanceof Date
          ? game.updatedAt.toISOString()
          : new Date(game.updatedAt).toISOString(),
    };
  }
}
