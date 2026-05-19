import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGameModelDto } from './dto/create-game-model.dto';
import { ListGameModelsQueryDto } from './dto/list-game-models-query.dto';
import { UpdateGameModelDto } from './dto/update-game-model.dto';
import { GameModel } from './entities/game-model.entity';
import { Like, Repository } from 'typeorm';
import { createPaginatedResult } from '../common/utils/pagination.util';
import { GameModelStatus } from './enums/game-model-status.enum';

@Injectable()
/**
 * 游戏模型服务负责模型增删改查与唯一性校验。
 */
export class GameModelService {
  /**
   * 注入游戏模型仓储，统一处理模型持久化操作。
   */
  constructor(
    @InjectRepository(GameModel)
    private readonly gameModelRepository: Repository<GameModel>,
  ) {}

  /**
   * 创建游戏模型，并校验模型编号与名称版本组合唯一性。
   */
  async create(createGameModelDto: CreateGameModelDto) {
    const normalizedInput = this.normalizeInput(createGameModelDto);

    const existingById = await this.gameModelRepository.findOne({
      where: { id: normalizedInput.id },
    });

    if (existingById) {
      throw new ConflictException('模型编号已存在');
    }

    const existingGameModel = await this.gameModelRepository.findOne({
      where: {
        name: normalizedInput.name,
        version: normalizedInput.version,
      },
    });

    if (existingGameModel) {
      throw new ConflictException('同名同版本模型已存在');
    }

    const gameModel = this.gameModelRepository.create(normalizedInput);
    const savedGameModel = await this.gameModelRepository.save(gameModel);

    return this.toGameModelResponse(savedGameModel);
  }

  /**
   * 分页查询游戏模型列表，并支持关键字与状态筛选。
   */
  async findAll(query?: ListGameModelsQueryDto) {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 10;
    const keyword = query?.keyword?.trim();

    const where = keyword
      ? [
          {
            ...(query?.status ? { status: query.status } : {}),
            id: Like(`%${keyword}%`),
          },
          {
            ...(query?.status ? { status: query.status } : {}),
            name: Like(`%${keyword}%`),
          },
          {
            ...(query?.status ? { status: query.status } : {}),
            description: Like(`%${keyword}%`),
          },
          {
            ...(query?.status ? { status: query.status } : {}),
            version: Like(`%${keyword}%`),
          },
        ]
      : query?.status
        ? { status: query.status }
        : undefined;

    const [items, total] = await this.gameModelRepository.findAndCount({
      where,
      order: { updatedAt: 'DESC', id: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return createPaginatedResult(
      items.map((item) => this.toGameModelResponse(item)),
      total,
      page,
      pageSize,
    );
  }

  /**
   * 根据模型编号查询单个游戏模型详情。
   */
  async findOne(id: string) {
    const gameModel = await this.gameModelRepository.findOne({ where: { id } });

    if (!gameModel) {
      throw new NotFoundException('游戏模型不存在');
    }

    return this.toGameModelResponse(gameModel);
  }

  /**
   * 更新指定游戏模型，并在关键字段变化时校验唯一性。
   */
  async update(id: string, updateGameModelDto: UpdateGameModelDto) {
    const gameModel = await this.gameModelRepository.findOne({ where: { id } });

    if (!gameModel) {
      throw new NotFoundException('游戏模型不存在');
    }

    const normalizedInput = this.normalizeInput(updateGameModelDto, gameModel);

    const hasKeyChanged =
      normalizedInput.name !== gameModel.name ||
      normalizedInput.version !== gameModel.version;

    if (hasKeyChanged) {
      const existingGameModel = await this.gameModelRepository.findOne({
        where: {
          name: normalizedInput.name,
          version: normalizedInput.version,
        },
      });

      if (existingGameModel && existingGameModel.id !== id) {
        throw new ConflictException('同名同版本模型已存在');
      }
    }

    Object.assign(gameModel, normalizedInput);
    const savedGameModel = await this.gameModelRepository.save(gameModel);

    return this.toGameModelResponse(savedGameModel);
  }

  /**
   * 删除指定游戏模型。
   */
  async remove(id: string) {
    const gameModel = await this.gameModelRepository.findOne({ where: { id } });

    if (!gameModel) {
      throw new NotFoundException('游戏模型不存在');
    }

    await this.gameModelRepository.remove(gameModel);

    return {
      id,
      message: '游戏模型删除成功',
    };
  }

  /**
   * 对创建和更新输入进行统一标准化收口。
   */
  private normalizeInput(
    input: Partial<CreateGameModelDto>,
    fallback?: Partial<GameModel>,
  ) {
    return {
      id: input.id?.trim() || fallback?.id || '',
      name: input.name?.trim() || fallback?.name || '',
      description: input.description?.trim() || fallback?.description || '',
      version: input.version?.trim() || fallback?.version || '',
      drawConfigJson: input.drawConfigJson ?? fallback?.drawConfigJson ?? null,
      resultSchemaJson:
        input.resultSchemaJson ?? fallback?.resultSchemaJson ?? null,
      status: input.status || fallback?.status || GameModelStatus.ACTIVE,
    };
  }

  /**
   * 将模型实体转换为前端可直接消费的响应结构。
   */
  private toGameModelResponse(gameModel: GameModel) {
    return {
      id: gameModel.id,
      name: gameModel.name,
      description: gameModel.description,
      version: gameModel.version,
      drawConfigJson: gameModel.drawConfigJson ?? null,
      resultSchemaJson: gameModel.resultSchemaJson ?? null,
      status: gameModel.status,
      createdAt:
        gameModel.createdAt instanceof Date
          ? gameModel.createdAt.toISOString()
          : new Date(gameModel.createdAt).toISOString(),
      updatedAt:
        gameModel.updatedAt instanceof Date
          ? gameModel.updatedAt.toISOString()
          : new Date(gameModel.updatedAt).toISOString(),
    };
  }
}
