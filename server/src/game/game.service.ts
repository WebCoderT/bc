import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { createPaginatedResult } from '../common/utils/pagination.util';
import { ApiPaginatedData } from '../common/interfaces/api-response.interface';
import { CreateGameDto } from './dto/create-game.dto';
import { ListGamesByParentNavigationQueryDto } from './dto/list-games-by-parent-navigation-query.dto';
import { ListGamesQueryDto } from './dto/list-games-query.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { GameType } from './enums/game-type.enum';
import { GameResponseDto } from './dto/game-response.dto';
import { NavigationEntity } from '../navigator/entities/navigator.entity';
import { NavigationType } from '../navigator/enums/navigation-type.enum';
import { NavigationStatus } from '../navigator/enums/navigation-status.enum';
import { resolveNavigationPath } from '../navigator/utils/navigation-path.util';
import { GameModel } from '../game-model/entities/game-model.entity';

@Injectable()
/**
 * 游戏服务负责游戏增删改查、导航校验以及前台分组分页查询。
 */
export class GameService {
  /**
   * 注入游戏、导航和游戏模型仓储，统一处理游戏相关业务逻辑。
   */
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(NavigationEntity)
    private readonly navigationRepository: Repository<NavigationEntity>,
    @InjectRepository(GameModel)
    private readonly gameModelRepository: Repository<GameModel>,
  ) {}

  /**
   * 创建游戏，并校验游戏名称、分类导航和游戏模型合法性。
   */
  async create(createGameDto: CreateGameDto) {
    const normalizedInput = this.normalizeInput(createGameDto);
    await this.ensureCategoryIsValid(normalizedInput.category);
    await this.ensureGameModelIsValid(normalizedInput.gameModelId);
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

  /**
   * 分页查询游戏列表，并支持关键字搜索名称、简介和模型编号。
   */
  async findAll(query?: ListGamesQueryDto) {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 10;
    const keyword = query?.keyword?.trim();

    const where = keyword
      ? [
          { label: Like(`%${keyword}%`) },
          { description: Like(`%${keyword}%`) },
          { gameModelId: Like(`%${keyword}%`) },
        ]
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

  /**
   * 根据游戏 ID 查询单个游戏详情。
   */
  async findOne(id: number) {
    const game = await this.gameRepository.findOne({ where: { id } });

    if (!game) {
      throw new NotFoundException('游戏不存在');
    }

    return this.toGameResponse(game);
  }

  /**
   * 根据菜单 ID 分页查询其下可浏览的游戏。
   *
   * - 传入一级菜单时，聚合其下所有可见二级菜单对应的游戏。
   * - 传入二级菜单时，只返回当前菜单下的游戏。
   */
  async findAllByNavigationIdForMember(
    navigationId: number,
    query?: ListGamesQueryDto,
  ): Promise<ApiPaginatedData<GameResponseDto>> {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 10;
    const keyword = query?.keyword?.trim();

    const navigation = await this.navigationRepository.findOne({
      where: { id: navigationId },
    });

    if (!navigation || !this.isVisibleNavigation(navigation)) {
      throw new NotFoundException('菜单不存在');
    }

    const categoryIds = await this.resolveVisibleCategoryIds(navigation);

    if (categoryIds.length === 0) {
      return createPaginatedResult([], 0, page, pageSize);
    }

    const queryBuilder = this.gameRepository
      .createQueryBuilder('game')
      .where('game.category IN (:...categoryIds)', {
        categoryIds,
      });

    if (keyword) {
      queryBuilder.andWhere(
        '(game.label LIKE :keyword OR game.description LIKE :keyword OR game.gameModelId LIKE :keyword)',
        {
          keyword: `%${keyword}%`,
        },
      );
    }

    const [games, total] = await queryBuilder
      .orderBy('game.updatedAt', 'DESC')
      .addOrderBy('game.id', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return createPaginatedResult(
      games.map((game) => this.toGameResponse(game)),
      total,
      page,
      pageSize,
    );
  }

  /**
   * 根据一级父级导航分页读取其下二级导航分组，并对每个分组内游戏再次分页。
   */
  async findGroupedByParentNavigation(
    parentId: number,
    query?: ListGamesByParentNavigationQueryDto,
  ) {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 10;
    const gamePage = query?.gamePage ?? 1;
    const gamePageSize = query?.gamePageSize ?? 10;

    const parentNavigation = await this.navigationRepository.findOne({
      where: { id: parentId },
    });

    if (!parentNavigation || !this.isVisibleNavigation(parentNavigation)) {
      throw new NotFoundException('父级导航不存在');
    }

    if (parentNavigation.parentId !== null) {
      throw new BadRequestException('仅支持按一级父级导航查询');
    }

    if (parentNavigation.type !== NavigationType.Side) {
      throw new BadRequestException('仅支持按侧边导航查询游戏');
    }

    const [childNavigations, total] =
      await this.navigationRepository.findAndCount({
        where: {
          parentId,
          status: NavigationStatus.Visible,
          type: NavigationType.Side,
        },
        order: { sort: 'ASC', id: 'ASC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

    const groupedItems = await Promise.all(
      childNavigations.map(async (navigation) => {
        const [games, gamesTotal] = await this.gameRepository.findAndCount({
          where: { category: navigation.id },
          order: { updatedAt: 'DESC', id: 'ASC' },
          skip: (gamePage - 1) * gamePageSize,
          take: gamePageSize,
        });

        return {
          navigation: this.toNavigationResponse(navigation),
          games: createPaginatedResult(
            games.map((game) => this.toGameResponse(game)),
            gamesTotal,
            gamePage,
            gamePageSize,
          ),
        };
      }),
    );

    return createPaginatedResult(groupedItems, total, page, pageSize);
  }

  /**
   * 更新指定游戏，并在必要时校验名称唯一性与关联数据合法性。
   */
  async update(id: number, updateGameDto: UpdateGameDto) {
    const game = await this.gameRepository.findOne({ where: { id } });

    if (!game) {
      throw new NotFoundException('游戏不存在');
    }

    const normalizedInput = this.normalizeInput(updateGameDto, game);
    await this.ensureCategoryIsValid(normalizedInput.category);
    await this.ensureGameModelIsValid(normalizedInput.gameModelId);

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

  /**
   * 删除指定游戏。
   */
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

  /**
   * 对创建和更新入参做统一标准化处理。
   */
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
      gameModelId: input.gameModelId?.trim() || fallback?.gameModelId || '',
      drawInterval:
        typeof input.drawInterval === 'number'
          ? input.drawInterval
          : Number(fallback?.drawInterval ?? 0),
      status: input.status || fallback?.status || GameType.ONLINE,
    };
  }

  /**
   * 校验游戏分类必须是存在的侧边导航。
   */
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

  /**
   * 解析当前菜单下可用于查询游戏的分类菜单 ID 列表。
   */
  private async resolveVisibleCategoryIds(navigation: NavigationEntity) {
    if (navigation.parentId !== null) {
      const parent = await this.navigationRepository.findOne({
        where: { id: navigation.parentId },
      });

      if (parent && !this.isVisibleNavigation(parent)) {
        throw new NotFoundException('菜单不存在');
      }

      return [navigation.id];
    }

    const childNavigations = await this.navigationRepository.find({
      where: {
        parentId: navigation.id,
        status: NavigationStatus.Visible,
        type: NavigationType.Side,
      },
      order: { sort: 'ASC', id: 'ASC' },
    });

    return childNavigations.map((childNavigation) => childNavigation.id);
  }

  /**
   * 校验关联的游戏模型必须存在。
   */
  private async ensureGameModelIsValid(gameModelId: string) {
    const normalizedGameModelId = gameModelId?.trim();

    if (!normalizedGameModelId) {
      throw new BadRequestException('游戏模型不能为空');
    }

    const gameModel = await this.gameModelRepository.findOne({
      where: { id: normalizedGameModelId },
    });

    if (!gameModel) {
      throw new NotFoundException('关联的游戏模型不存在');
    }
  }

  /**
   * 判断导航是否为前台可见状态。
   */
  private isVisibleNavigation(navigation: NavigationEntity) {
    return navigation.status === NavigationStatus.Visible;
  }

  /**
   * 将导航实体转换为分组接口使用的导航响应结构。
   */
  private toNavigationResponse(navigation: NavigationEntity) {
    return {
      id: navigation.id,
      name: navigation.name,
      path: resolveNavigationPath(navigation.id, navigation.path),
      description: navigation.description,
      icon: navigation.icon,
      type: navigation.type,
      status: navigation.status,
      sort: Number(navigation.sort ?? 0),
      parentId: navigation.parentId ?? null,
      level: navigation.parentId ? 2 : 1,
      children: [],
      createdAt:
        navigation.createdAt instanceof Date
          ? navigation.createdAt.toISOString()
          : new Date(navigation.createdAt).toISOString(),
      updatedAt:
        navigation.updatedAt instanceof Date
          ? navigation.updatedAt.toISOString()
          : new Date(navigation.updatedAt).toISOString(),
    };
  }

  /**
   * 将游戏实体转换为统一响应结构。
   */
  private toGameResponse(game: Game) {
    return {
      id: game.id,
      label: game.label,
      description: game.description,
      iconUrl: game.iconUrl || '',
      category: Number(game.category ?? 0),
      gameModelId: String(game.gameModelId ?? ''),
      status: game.status,
      drawInterval: Number(game.drawInterval ?? 0),
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
