import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../game/entities/game.entity';
import { GameType } from '../game/enums/game-type.enum';
import { GameModel } from '../game-model/entities/game-model.entity';
import { GameCurrentIssueResponseDto } from './dto/game-current-issue-response.dto';
import { DrawRecordQueryDto } from './dto/draw-record-query.dto';
import { GameDrawRecordResponseDto } from './dto/game-draw-record-response.dto';
import { GameDrawJobLogEntity } from './entities/game-draw-job-log.entity';
import { GameDrawJobStatus } from './enums/game-draw-job-status.enum';
import { GameDrawRecordStatus } from './enums/game-draw-record-status.enum';
import { GameDrawSourceType } from './enums/game-draw-source-type.enum';
import { generateIssueNo } from './utils/draw-issue.util';
import { parseJsonField } from './utils/draw-json.util';
import { GameDrawHistoryService } from './game-draw-history.service';
import { GameDrawRuntimeService } from './game-draw-runtime.service';
import { GameDrawStrategyRegistry } from './game-draw-strategy.registry';
import { GameDrawTableService } from './game-draw-table.service';

@Injectable()
export class GameDrawService {
  private readonly logger = new Logger(GameDrawService.name);

  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(GameModel)
    private readonly gameModelRepository: Repository<GameModel>,
    @InjectRepository(GameDrawJobLogEntity)
    private readonly jobLogRepository: Repository<GameDrawJobLogEntity>,
    private readonly gameDrawRuntimeService: GameDrawRuntimeService,
    private readonly gameDrawStrategyRegistry: GameDrawStrategyRegistry,
    private readonly gameDrawTableService: GameDrawTableService,
    private readonly gameDrawHistoryService: GameDrawHistoryService,
  ) {}

  async initializeGameResources(gameId: number) {
    const game = await this.getGameForDraw(gameId);
    await this.gameDrawTableService.createDrawTableIfNotExists(game.id);
    await this.gameDrawRuntimeService.initializeForGame(game);
  }

  async syncGameResources(gameId: number) {
    const game = await this.getGameForDraw(gameId);
    await this.gameDrawTableService.createDrawTableIfNotExists(game.id);
    await this.gameDrawRuntimeService.initializeForGame(game);
  }

  async drawOnce(
    gameId: number,
    sourceType = GameDrawSourceType.System,
    strict = false,
  ): Promise<GameDrawRecordResponseDto | null> {
    const startedAt = new Date();
    let runtime = await this.gameDrawRuntimeService.tryLockByGameId(gameId);
    let statusAlreadyHandled = false;

    if (!runtime) {
      const existingRuntime =
        await this.gameDrawRuntimeService.findByGameId(gameId);

      if (!existingRuntime) {
        await this.initializeGameResources(gameId);
        runtime = await this.gameDrawRuntimeService.tryLockByGameId(gameId);
      }
    }

    if (!runtime) {
      if (strict) {
        throw new BadRequestException('当前游戏无法执行开奖，请稍后再试');
      }

      return null;
    }

    let issueNo = runtime.currentIssue || null;

    try {
      const game = await this.getGameForDraw(gameId);
      const gameModelId = game.gameModelId || game.gameModel?.id || '';

      if (game.status !== GameType.ONLINE) {
        await this.gameDrawRuntimeService.markPaused(
          gameId,
          '游戏未处于在线状态',
        );
        await this.writeJobLog({
          gameId,
          issueNo: issueNo ?? 'N/A',
          status: GameDrawJobStatus.Skipped,
          drawTableName: this.gameDrawTableService.getDrawTableName(gameId),
          message: '游戏未处于在线状态，已跳过开奖',
          startedAt,
          finishedAt: new Date(),
        });
        statusAlreadyHandled = true;

        if (strict) {
          throw new BadRequestException('游戏未处于在线状态，无法开奖');
        }

        return null;
      }

      issueNo = issueNo || (await this.resolveCurrentIssueNo(gameId));
      const drawTime = new Date();
      const config = this.resolveDrawConfig(game.gameModel);
      const strategy = this.gameDrawStrategyRegistry.getStrategy(gameModelId);
      const drawResult = strategy.generateDraw({
        gameId,
        gameModelId,
        issueNo,
        drawTime,
        config,
      });

      const record = await this.gameDrawTableService.insertDrawRecord(gameId, {
        issueNo,
        openCode: drawResult.openCode,
        openCodeJson: drawResult.openCodeJson,
        resultPayload: drawResult.resultPayload,
        drawTime,
        drawStatus: GameDrawRecordStatus.Open,
        sourceType,
        algorithmVersion: drawResult.algorithmVersion,
      });

      const nextIssue = generateIssueNo(issueNo, drawTime);
      const nextDrawAt = new Date(
        drawTime.getTime() + game.drawInterval * 1000,
      );

      await this.gameDrawRuntimeService.markSuccess({
        gameId,
        drawTime,
        nextDrawAt,
        nextIssue,
      });
      await this.writeJobLog({
        gameId,
        issueNo,
        status: GameDrawJobStatus.Success,
        drawTableName: this.gameDrawTableService.getDrawTableName(gameId),
        message: `开奖成功，号码 ${record.openCode}`,
        startedAt,
        finishedAt: new Date(),
      });

      return record;
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知开奖错误';
      this.logger.error(`游戏 ${gameId} 开奖失败: ${message}`);

      if (!statusAlreadyHandled) {
        await this.gameDrawRuntimeService.markError(gameId, message);
        await this.writeJobLog({
          gameId,
          issueNo: issueNo ?? 'N/A',
          status: GameDrawJobStatus.Failed,
          drawTableName: this.gameDrawTableService.getDrawTableName(gameId),
          message,
          startedAt,
          finishedAt: new Date(),
        });
      }

      throw error;
    }
  }

  manualDraw(gameId: number) {
    return this.drawOnce(gameId, GameDrawSourceType.Manual, true);
  }

  async listRecentDraws(gameId: number, query?: DrawRecordQueryDto) {
    await this.ensureGameExists(gameId);
    return this.gameDrawHistoryService.listRecentDraws(
      gameId,
      query?.page ?? 1,
      query?.pageSize ?? 20,
    );
  }

  async getCurrentIssue(gameId: number): Promise<GameCurrentIssueResponseDto> {
    await this.ensureGameExists(gameId);
    const runtime = await this.gameDrawRuntimeService.findByGameId(gameId);

    if (!runtime) {
      await this.initializeGameResources(gameId);
      const initialized =
        await this.gameDrawRuntimeService.findByGameId(gameId);

      if (!initialized) {
        throw new NotFoundException('未找到游戏开奖运行时信息');
      }

      return this.toCurrentIssueResponse(initialized);
    }

    return this.toCurrentIssueResponse(runtime);
  }

  async rebuildDrawTable(gameId: number) {
    await this.initializeGameResources(gameId);
    return {
      gameId,
      tableName: this.gameDrawTableService.getDrawTableName(gameId),
      message: '开奖表重建成功',
    };
  }

  private async getGameForDraw(gameId: number) {
    const game = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.gameModel', 'gameModel')
      .where('game.id = :gameId', { gameId })
      .getOne();

    if (!game) {
      throw new NotFoundException('游戏不存在');
    }

    return game;
  }

  private async ensureGameExists(gameId: number) {
    const total = await this.gameRepository.count({ where: { id: gameId } });

    if (total === 0) {
      throw new NotFoundException('游戏不存在');
    }
  }

  private async resolveCurrentIssueNo(gameId: number) {
    const latestIssueNo =
      await this.gameDrawTableService.getLatestIssueNo(gameId);
    return generateIssueNo(latestIssueNo, new Date());
  }

  private resolveDrawConfig(gameModel: GameModel) {
    const defaultConfig =
      gameModel.id === 'p5'
        ? {
            digits: 5,
            min: 0,
            max: 9,
            allowRepeat: true,
          }
        : {};

    return parseJsonField<Record<string, unknown>>(
      gameModel.drawConfigJson,
      defaultConfig,
    );
  }

  private async writeJobLog(params: {
    gameId: number;
    issueNo: string;
    drawTableName: string;
    status: GameDrawJobStatus;
    message: string;
    startedAt: Date;
    finishedAt: Date;
  }) {
    const log = this.jobLogRepository.create({
      gameId: params.gameId,
      issueNo: params.issueNo,
      drawTableName: params.drawTableName,
      status: params.status,
      message: params.message,
      startedAt: params.startedAt,
      finishedAt: params.finishedAt,
    });

    await this.jobLogRepository.save(log);
  }

  private toCurrentIssueResponse(runtime: {
    gameId: number;
    currentIssue: string | null;
    lastDrawAt: Date | null;
    nextDrawAt: Date;
    drawInterval: number;
    status: string;
  }): GameCurrentIssueResponseDto {
    return {
      gameId: runtime.gameId,
      currentIssue: runtime.currentIssue,
      lastDrawAt: runtime.lastDrawAt ? runtime.lastDrawAt.toISOString() : null,
      nextDrawAt: runtime.nextDrawAt.toISOString(),
      drawInterval: runtime.drawInterval,
      status: runtime.status as GameCurrentIssueResponseDto['status'],
    };
  }
}
