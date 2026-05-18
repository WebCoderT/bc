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
export class GameModelService {
  constructor(
    @InjectRepository(GameModel)
    private readonly gameModelRepository: Repository<GameModel>,
  ) {}

  async create(createGameModelDto: CreateGameModelDto) {
    const normalizedInput = this.normalizeInput(createGameModelDto);
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

  async findAll(query?: ListGameModelsQueryDto) {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 10;
    const keyword = query?.keyword?.trim();

    const where = {
      ...(query?.status ? { status: query.status } : {}),
      ...(keyword ? ({ name: Like(`%${keyword}%`) } as const) : {}),
    };

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

  async findOne(id: number) {
    const gameModel = await this.gameModelRepository.findOne({ where: { id } });

    if (!gameModel) {
      throw new NotFoundException('游戏模型不存在');
    }

    return this.toGameModelResponse(gameModel);
  }

  async update(id: number, updateGameModelDto: UpdateGameModelDto) {
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

  async remove(id: number) {
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

  private normalizeInput(
    input: Partial<CreateGameModelDto>,
    fallback?: Partial<GameModel>,
  ) {
    const normalizedDrawInterval =
      typeof input.drawInterval === 'number'
        ? input.drawInterval
        : fallback?.drawInterval;

    return {
      name: input.name?.trim() || fallback?.name || '',
      description: input.description?.trim() || fallback?.description || '',
      version: input.version?.trim() || fallback?.version || '',
      status: input.status || fallback?.status || GameModelStatus.ACTIVE,
      drawInterval:
        typeof normalizedDrawInterval === 'number'
          ? normalizedDrawInterval
          : undefined,
    };
  }

  private toGameModelResponse(gameModel: GameModel) {
    return {
      id: gameModel.id,
      name: gameModel.name,
      description: gameModel.description,
      version: gameModel.version,
      status: gameModel.status,
      drawInterval:
        typeof gameModel.drawInterval === 'number'
          ? gameModel.drawInterval
          : null,
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
