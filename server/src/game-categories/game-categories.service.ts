import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateGameCategoryDto } from './dto/create-game-category.dto';
import { ListGameCategoriesQueryDto } from './dto/list-game-categories-query.dto';
import { UpdateGameCategoryDto } from './dto/update-game-category.dto';
import { GameCategoryEntity } from './entities/game-category.entity';
import { GameCategoryStatus } from './enums/game-category-status.enum';

@Injectable()
export class GameCategoriesService implements OnModuleInit {
  private static seedPromise: Promise<void> | null = null;

  private readonly gameCategoriesRepository: Repository<GameCategoryEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.gameCategoriesRepository =
      this.dataSource.getRepository<GameCategoryEntity>(GameCategoryEntity);
  }

  async onModuleInit() {
    if (!GameCategoriesService.seedPromise) {
      GameCategoriesService.seedPromise = this.seedDefaultCategories();
    }

    await GameCategoriesService.seedPromise;
  }

  async listCategories(query?: ListGameCategoriesQueryDto) {
    const keyword = query?.keyword?.trim();
    const queryBuilder = this.gameCategoriesRepository
      .createQueryBuilder('category')
      .orderBy('category.isRecommended', 'DESC')
      .addOrderBy('category.heat', 'DESC')
      .addOrderBy('category.updatedAt', 'DESC')
      .addOrderBy('category.id', 'ASC');

    if (keyword) {
      queryBuilder.andWhere(
        '(category.name LIKE :keyword OR category.description LIKE :keyword)',
        {
          keyword: `%${keyword}%`,
        },
      );
    }

    if (query?.status) {
      queryBuilder.andWhere('category.status = :status', {
        status: query.status,
      });
    }

    if (typeof query?.isRecommended === 'boolean') {
      queryBuilder.andWhere('category.isRecommended = :isRecommended', {
        isRecommended: query.isRecommended,
      });
    }

    const categories = await queryBuilder.getMany();

    const items = categories.map((item) => this.toSafeCategory(item));

    return {
      items,
      total: items.length,
    };
  }

  async createCategory(input: CreateGameCategoryDto) {
    const normalizedInput = this.normalizeInput(input);
    const existingCategory = await this.gameCategoriesRepository.findOne({
      where: { name: normalizedInput.name },
    });

    if (existingCategory) {
      throw new ConflictException('分类名称已存在');
    }

    const category = this.gameCategoriesRepository.create({
      ...normalizedInput,
      gameCount: 0,
    });

    const savedCategory = await this.gameCategoriesRepository.save(category);
    return this.toSafeCategory(savedCategory);
  }

  async updateCategory(id: number, input: UpdateGameCategoryDto) {
    const category = await this.gameCategoriesRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('游戏分类不存在');
    }

    const normalizedInput = this.normalizeInput(input, category);

    if (normalizedInput.name && normalizedInput.name !== category.name) {
      const existingCategory = await this.gameCategoriesRepository.findOne({
        where: { name: normalizedInput.name },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('分类名称已存在');
      }
    }

    Object.assign(category, normalizedInput);
    const savedCategory = await this.gameCategoriesRepository.save(category);
    return this.toSafeCategory(savedCategory);
  }

  async deleteCategory(id: number) {
    const category = await this.gameCategoriesRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('游戏分类不存在');
    }

    await this.gameCategoriesRepository.remove(category);

    return {
      id,
      message: '游戏分类删除成功',
    };
  }

  private toSafeCategory(category: GameCategoryEntity) {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      tags: Array.isArray(category.tags) ? category.tags : [],
      isRecommended: Boolean(category.isRecommended),
      heat: Number(category.heat ?? 0),
      status: category.status,
      gameCount: Number(category.gameCount ?? 0),
      createdAt:
        category.createdAt instanceof Date
          ? category.createdAt.toISOString()
          : new Date(category.createdAt).toISOString(),
      updatedAt:
        category.updatedAt instanceof Date
          ? category.updatedAt.toISOString()
          : new Date(category.updatedAt).toISOString(),
    };
  }

  private normalizeInput(
    input: Partial<CreateGameCategoryDto>,
    fallback?: Partial<GameCategoryEntity>,
  ) {
    return {
      name: input.name?.trim() || fallback?.name || '',
      description: input.description?.trim() || fallback?.description || '',
      tags: this.normalizeTags(input.tags ?? fallback?.tags ?? []),
      isRecommended:
        typeof input.isRecommended === 'boolean'
          ? input.isRecommended
          : Boolean(fallback?.isRecommended),
      heat:
        typeof input.heat === 'number'
          ? input.heat
          : Number(fallback?.heat ?? 0),
      status: input.status || fallback?.status || GameCategoryStatus.Enabled,
    };
  }

  private normalizeTags(tags: string[]) {
    return [...new Set(tags.map((item) => item.trim()).filter(Boolean))].slice(
      0,
      10,
    );
  }

  private async seedDefaultCategories() {
    const count = await this.gameCategoriesRepository.count();

    if (count > 0) {
      return;
    }

    const defaultCategories = [
      {
        name: '角色扮演',
        description: '高沉浸叙事与角色成长型游戏',
        tags: ['成长', '剧情', '开放世界'],
        isRecommended: true,
        heat: 97,
        status: GameCategoryStatus.Enabled,
      },
      {
        name: '卡牌策略',
        description: '长线养成与对战策略玩法集合',
        tags: ['养成', '策略', '回合制'],
        isRecommended: true,
        heat: 95,
        status: GameCategoryStatus.Enabled,
      },
      {
        name: '模拟经营',
        description: '轻中度经营、建造与模拟体验',
        tags: ['经营', '建造', '轻度'],
        isRecommended: false,
        heat: 72,
        status: GameCategoryStatus.Pending,
      },
      {
        name: '动作冒险',
        description: '动作闯关、多人挑战与剧情探索',
        tags: ['动作', '副本', '合作'],
        isRecommended: true,
        heat: 90,
        status: GameCategoryStatus.Enabled,
      },
    ];

    await this.gameCategoriesRepository.save(
      defaultCategories.map((item) =>
        this.gameCategoriesRepository.create({
          ...item,
          gameCount: 0,
        }),
      ),
    );
  }
}
