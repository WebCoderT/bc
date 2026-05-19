import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, LessThanOrEqual, Repository } from 'typeorm';
import { Game } from '../game/entities/game.entity';
import { GameType } from '../game/enums/game-type.enum';
import { GameDrawRuntimeEntity } from './entities/game-draw-runtime.entity';
import { GameDrawRuntimeStatus } from './enums/game-draw-runtime-status.enum';
import { generateIssueNo } from './utils/draw-issue.util';
import { getDrawTableName } from './utils/draw-table-name.util';

@Injectable()
export class GameDrawRuntimeService {
  constructor(
    @InjectRepository(GameDrawRuntimeEntity)
    private readonly runtimeRepository: Repository<GameDrawRuntimeEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async initializeForGame(game: Game) {
    const existing = await this.runtimeRepository.findOne({
      where: { gameId: game.id },
    });
    const now = new Date();
    const gameModelId = game.gameModelId || game.gameModel?.id || '';
    const currentIssue = existing?.currentIssue ?? generateIssueNo(null, now);
    const nextDrawAt = new Date(now.getTime() + game.drawInterval * 1000);
    const nextStatus =
      game.status === GameType.ONLINE
        ? GameDrawRuntimeStatus.Idle
        : GameDrawRuntimeStatus.Paused;

    const runtime = this.runtimeRepository.create({
      id: existing?.id,
      gameId: game.id,
      gameModelId,
      drawTableName: getDrawTableName(game.id),
      currentIssue,
      lastDrawAt: existing?.lastDrawAt ?? null,
      nextDrawAt,
      drawInterval: game.drawInterval,
      status: nextStatus,
      lastErrorMessage: existing?.lastErrorMessage ?? null,
      lockedAt: null,
    });

    return this.runtimeRepository.save(runtime);
  }

  findByGameId(gameId: number) {
    return this.runtimeRepository.findOne({ where: { gameId } });
  }

  async listDueGames(limit = 100) {
    return this.runtimeRepository.find({
      where: {
        status: In([GameDrawRuntimeStatus.Idle, GameDrawRuntimeStatus.Error]),
        nextDrawAt: LessThanOrEqual(new Date()),
      },
      order: { nextDrawAt: 'ASC', gameId: 'ASC' },
      take: limit,
    });
  }

  async tryLockByGameId(gameId: number) {
    return this.dataSource.transaction(async (manager) => {
      const runtime = await manager.findOne(GameDrawRuntimeEntity, {
        where: { gameId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!runtime) {
        return null;
      }

      if (
        runtime.status !== GameDrawRuntimeStatus.Idle &&
        runtime.status !== GameDrawRuntimeStatus.Error
      ) {
        return null;
      }

      runtime.status = GameDrawRuntimeStatus.Drawing;
      runtime.lockedAt = new Date();
      return manager.save(runtime);
    });
  }

  async markSuccess(params: {
    gameId: number;
    drawTime: Date;
    nextDrawAt: Date;
    nextIssue: string;
  }) {
    await this.runtimeRepository.update(
      { gameId: params.gameId },
      {
        lastDrawAt: params.drawTime,
        nextDrawAt: params.nextDrawAt,
        currentIssue: params.nextIssue,
        status: GameDrawRuntimeStatus.Idle,
        lastErrorMessage: null,
        lockedAt: null,
      },
    );
  }

  async markError(gameId: number, message: string) {
    await this.runtimeRepository.update(
      { gameId },
      {
        status: GameDrawRuntimeStatus.Error,
        lastErrorMessage: message,
        lockedAt: null,
      },
    );
  }

  async markPaused(gameId: number, message?: string | null) {
    await this.runtimeRepository.update(
      { gameId },
      {
        status: GameDrawRuntimeStatus.Paused,
        lastErrorMessage: message ?? null,
        lockedAt: null,
      },
    );
  }
}
