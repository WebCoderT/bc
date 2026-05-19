import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BetSettlementService } from 'src/bet/bet-settlement.service';
import { Game } from '../game/entities/game.entity';
import { GameType } from '../game/enums/game-type.enum';
import { GameModel } from '../game-model/entities/game-model.entity';
import { DEFAULT_DRAW_CONFIGS } from '../game-model/default-game-models';
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
import { RealtimeEventsService } from '../realtime/realtime-events.service';

@Injectable()
/**
 * 开奖服务负责串联运行时、开奖策略、开奖表、结算和实时推送。
 */
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
    private readonly realtimeEventsService: RealtimeEventsService,
    private readonly betSettlementService: BetSettlementService,
  ) { }

  /**
   * 初始化单个游戏的开奖基础资源，包括开奖记录表和运行时信息。
   */
  async initializeGameResources(gameId: number) {
    const game = await this.getGameForDraw(gameId);
    await this.gameDrawTableService.createDrawTableIfNotExists(game.id);
    await this.gameDrawRuntimeService.initializeForGame(game);
  }

  /**
   * 同步游戏开奖资源，当前逻辑与初始化一致，保留独立语义给后台接口使用。
   */
  async syncGameResources(gameId: number) {
    const game = await this.getGameForDraw(gameId);
    await this.gameDrawTableService.createDrawTableIfNotExists(game.id);
    await this.gameDrawRuntimeService.initializeForGame(game);
  }

  /**
   * 执行一次开奖。
   * strict 为 true 时把不可开奖场景直接抛错，false 时返回 null 供调度器跳过。
   */
  async drawOnce(
    gameId: number,
    sourceType = GameDrawSourceType.System,
    strict = false,
  ): Promise<GameDrawRecordResponseDto | null> {
    const startedAt = new Date();
    // 先尝试对当前游戏运行时加锁，避免并发开奖。
    let runtime = await this.gameDrawRuntimeService.tryLockByGameId(gameId);
    let statusAlreadyHandled = false;

    if (!runtime) {
      const existingRuntime =
        await this.gameDrawRuntimeService.findByGameId(gameId);

      // 首次开奖可能还没有运行时记录，这里补做一次初始化后重试加锁。
      if (!existingRuntime) {
        await this.initializeGameResources(gameId);
        runtime = await this.gameDrawRuntimeService.tryLockByGameId(gameId);
      }
    }

    // 仍然拿不到锁说明已有其他执行流在处理当前游戏。
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

      // 非在线游戏直接标记暂停并记日志，不继续执行开奖。
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

      // 没有当前期号时，基于最近一期记录推导出新期号。
      issueNo = issueNo || (await this.resolveCurrentIssueNo(gameId));
      const drawTime = new Date();
      const config = this.resolveDrawConfig(game.gameModel);
      const strategy = this.gameDrawStrategyRegistry.getStrategy(gameModelId);

      // 具体号码生成由模型策略负责，服务层只负责拼装上下文和推进后续流程。
      const drawResult = strategy.generateDraw({
        gameId,
        gameModelId,
        issueNo,
        drawTime,
        config,
      });

      const record = await this.insertOrReuseDrawRecord({
        gameId,
        issueNo,
        openCode: drawResult.openCode,
        openCodeJson: drawResult.openCodeJson,
        resultPayload: drawResult.resultPayload,
        drawTime,
        sourceType,
        algorithmVersion: drawResult.algorithmVersion,
      });

      // 开奖完成后立即结算当前期相关注单。
      await this.betSettlementService.settleOrdersForDraw({
        gameId,
        issueNo,
        openCode: record.openCode,
        openCodeJson: record.openCodeJson,
      });

      const nextIssue = generateIssueNo(issueNo, drawTime);
      const nextDrawAt = new Date(
        drawTime.getTime() + game.drawInterval * 1000,
      );

      // 更新运行时状态，让下一次调度知道下一期和下一次开奖时间。
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

      // 推送最新开奖结果和当前期信息给前端实时订阅方。
      this.realtimeEventsService.emitGameDrawUpdated({
        gameId,
        record,
        currentIssue: await this.getCurrentIssue(gameId),
      });

      return record;
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知开奖错误';
      this.logger.error(`游戏 ${gameId} 开奖失败: ${message}`);

      // 前面若已把状态写成 paused/skipped，这里不重复覆盖成 error。
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

  /**
   * 后台手动开奖入口，固定使用人工来源并在失败时直接抛错。
   */
  manualDraw(gameId: number) {
    return this.drawOnce(gameId, GameDrawSourceType.Manual, true);
  }

  /**
   * 分页查询某个游戏最近的开奖记录。
   */
  async listRecentDraws(gameId: number, query?: DrawRecordQueryDto) {
    await this.ensureGameExists(gameId);
    return this.gameDrawHistoryService.listRecentDraws(
      gameId,
      query?.page ?? 1,
      query?.pageSize ?? 20,
    );
  }

  /**
   * 查询当前期运行时信息；首次访问时会补初始化缺失的运行时数据。
   */
  async getCurrentIssue(gameId: number): Promise<GameCurrentIssueResponseDto> {
    await this.ensureGameExists(gameId);
    const runtime = await this.gameDrawRuntimeService.findByGameId(gameId);

    if (!runtime) {
      // 某些旧数据或新游戏可能尚未建立运行时，按需补建。
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

  /**
   * 重建单个游戏的开奖资源，主要用于后台修复场景。
   */
  async rebuildDrawTable(gameId: number) {
    await this.initializeGameResources(gameId);
    return {
      gameId,
      tableName: this.gameDrawTableService.getDrawTableName(gameId),
      message: '开奖表重建成功',
    };
  }

  /**
   * 读取开奖所需的游戏和模型信息，不存在时直接抛错。
   */
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

  /**
   * 只校验游戏是否存在，供不需要联查模型的简单场景使用。
   */
  private async ensureGameExists(gameId: number) {
    const total = await this.gameRepository.count({ where: { id: gameId } });

    if (total === 0) {
      throw new NotFoundException('游戏不存在');
    }
  }

  /**
   * 根据最近一期期号推导当前应开奖期号。
   */
  private async resolveCurrentIssueNo(gameId: number) {
    const latestIssueNo =
      await this.gameDrawTableService.getLatestIssueNo(gameId);
    return generateIssueNo(latestIssueNo, new Date());
  }

  /**
   * 解析模型开奖配置；缺省时按模型类型回退到内置默认值。
   */
  private resolveDrawConfig(gameModel: GameModel) {
    const defaultConfig = DEFAULT_DRAW_CONFIGS[gameModel.id] ?? {};

    return parseJsonField<Record<string, unknown>>(
      gameModel.drawConfigJson,
      defaultConfig,
    );
  }

  /**
   * 写入一次开奖任务日志，统一记录成功、失败和跳过原因。
   */
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

  /**
   * 插入开奖结果；若期号已存在，则复用已有记录，保证重试具备幂等性。
   */
  private async insertOrReuseDrawRecord(params: {
    gameId: number;
    issueNo: string;
    openCode: string;
    openCodeJson: unknown;
    resultPayload: Record<string, unknown> | null;
    drawTime: Date;
    sourceType: GameDrawSourceType;
    algorithmVersion: string;
  }) {
    try {
      return await this.gameDrawTableService.insertDrawRecord(params.gameId, {
        issueNo: params.issueNo,
        openCode: params.openCode,
        openCodeJson: params.openCodeJson,
        resultPayload: params.resultPayload,
        drawTime: params.drawTime,
        drawStatus: GameDrawRecordStatus.Open,
        sourceType: params.sourceType,
        algorithmVersion: params.algorithmVersion,
      });
    } catch (error) {
      if (!this.isDuplicateIssueError(error)) {
        throw error;
      }

      // 并发或重试导致的重复期号不视为致命错误，直接回收已有记录继续推进。
      this.logger.warn(
        `游戏 ${params.gameId} 期号 ${params.issueNo} 已存在，复用已有开奖记录继续推进`,
      );

      const existingRecord =
        await this.gameDrawTableService.getDrawRecordByIssueNo(
          params.gameId,
          params.issueNo,
        );

      if (!existingRecord) {
        throw error;
      }

      return existingRecord;
    }
  }

  /**
   * 判断数据库异常是否属于期号唯一键冲突。
   */
  private isDuplicateIssueError(error: unknown) {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const code = 'code' in error ? String(error.code ?? '') : '';
    const message =
      'message' in error && typeof error.message === 'string'
        ? error.message
        : '';

    return (
      code === 'ER_DUP_ENTRY' ||
      (message.includes('Duplicate entry') && message.includes('uk_issue_no'))
    );
  }

  /**
   * 把运行时实体转换成接口返回结构，统一处理时间字段序列化。
   */
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
      serverTime: new Date().toISOString(),
      currentIssue: runtime.currentIssue,
      lastDrawAt: runtime.lastDrawAt ? runtime.lastDrawAt.toISOString() : null,
      nextDrawAt: runtime.nextDrawAt.toISOString(),
      drawInterval: runtime.drawInterval,
      status: runtime.status as GameCurrentIssueResponseDto['status'],
    };
  }
}
