import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Like, Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { ListGamesQueryDto } from './dto/list-games-query.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';

@Injectable()
export class GameService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly gameRepository: Repository<Game>,
  ) {}

  async create(createGameDto: CreateGameDto) {
    const normalizedInput = this.normalizeInput(createGameDto);
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

    return {
      items: games.map((game) => this.toGameResponse(game)),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
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
    };
  }

  private toGameResponse(game: Game) {
    return {
      id: game.id,
      label: game.label,
      description: game.description,
      iconUrl: game.iconUrl || '',
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
