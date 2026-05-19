import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GameType } from '../game/enums/game-type.enum';
import { RealtimeEventsService } from '../realtime/realtime-events.service';
import { GameDrawJobStatus } from './enums/game-draw-job-status.enum';
import { GameDrawSourceType } from './enums/game-draw-source-type.enum';
import { GameDrawService } from './game-draw.service';

describe('GameDrawService', () => {
  const createService = () => {
    const gameRepository = {
      createQueryBuilder: jest.fn(),
      count: jest.fn(),
    };
    const gameModelRepository = {};
    const jobLogRepository = {
      create: jest.fn((payload: Record<string, unknown>) => payload),
      save: jest.fn(),
    };
    const runtimeService = {
      tryLockByGameId: jest.fn(),
      findByGameId: jest.fn(),
      initializeForGame: jest.fn(),
      markSuccess: jest.fn(),
      markError: jest.fn(),
      markPaused: jest.fn(),
    };
    const strategyRegistry = {
      getStrategy: jest.fn(),
    };
    const tableService = {
      createDrawTableIfNotExists: jest.fn(),
      insertDrawRecord: jest.fn(),
      getLatestIssueNo: jest.fn(),
      getDrawTableName: jest.fn((gameId: number) => `game_draw_${gameId}`),
    };
    const historyService = {
      listRecentDraws: jest.fn(),
      getLatestDrawRecord: jest.fn(),
    };
    const realtimeEventsService = new RealtimeEventsService();
    const emitGameDrawUpdatedSpy = jest.spyOn(
      realtimeEventsService,
      'emitGameDrawUpdated',
    );

    const service = new GameDrawService(
      gameRepository as never,
      gameModelRepository as never,
      jobLogRepository as never,
      runtimeService as never,
      strategyRegistry as never,
      tableService as never,
      historyService as never,
      realtimeEventsService,
    );

    return {
      service,
      gameRepository,
      jobLogRepository,
      runtimeService,
      strategyRegistry,
      tableService,
      historyService,
      realtimeEventsService,
      emitGameDrawUpdatedSpy,
    };
  };

  it('should draw once successfully for online p5 game', async () => {
    const {
      service,
      gameRepository,
      jobLogRepository,
      runtimeService,
      strategyRegistry,
      tableService,
      emitGameDrawUpdatedSpy,
    } = createService();

    runtimeService.tryLockByGameId.mockResolvedValue({
      currentIssue: '2026051900001',
    });
    runtimeService.findByGameId.mockResolvedValue({
      gameId: 1,
      currentIssue: '2026051900002',
      lastDrawAt: new Date('2026-05-19T08:00:00.000Z'),
      nextDrawAt: new Date('2026-05-19T08:01:00.000Z'),
      drawInterval: 60,
      status: 'idle',
    });

    gameRepository.createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id: 1,
        drawInterval: 60,
        status: GameType.ONLINE,
        gameModelId: 'p5',
        gameModel: {
          id: 'p5',
          drawConfigJson: { digits: 5, min: 0, max: 9, allowRepeat: true },
        },
      }),
    });

    strategyRegistry.getStrategy.mockReturnValue({
      generateDraw: jest.fn().mockReturnValue({
        openCode: '1,2,3,4,5',
        openCodeJson: [1, 2, 3, 4, 5],
        resultPayload: { sum: 15, span: 4 },
        algorithmVersion: 'p5-v1',
      }),
    });

    tableService.insertDrawRecord.mockResolvedValue({
      id: 10,
      issueNo: '2026051900001',
      openCode: '1,2,3,4,5',
      openCodeJson: [1, 2, 3, 4, 5],
      resultPayload: { sum: 15, span: 4 },
      drawTime: '2026-05-19T08:00:00.000Z',
      drawStatus: 'open',
      sourceType: GameDrawSourceType.System,
      algorithmVersion: 'p5-v1',
      createdAt: '2026-05-19T08:00:00.000Z',
      updatedAt: '2026-05-19T08:00:00.000Z',
    });

    const result = await service.drawOnce(1);

    expect(result?.issueNo).toBe('2026051900001');
    expect(strategyRegistry.getStrategy).toHaveBeenCalledWith('p5');
    expect(tableService.insertDrawRecord).toHaveBeenCalled();
    expect(runtimeService.markSuccess).toHaveBeenCalled();
    expect(emitGameDrawUpdatedSpy).toHaveBeenCalled();
    expect(jobLogRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: GameDrawJobStatus.Success }),
    );
  });

  it('should reject manual draw for offline game', async () => {
    const { service, gameRepository, runtimeService } = createService();

    runtimeService.tryLockByGameId.mockResolvedValue({
      currentIssue: '2026051900001',
    });

    gameRepository.createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id: 1,
        drawInterval: 60,
        status: GameType.OFFLINE,
        gameModelId: 'p5',
        gameModel: { id: 'p5', drawConfigJson: null },
      }),
    });

    await expect(service.manualDraw(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(runtimeService.markPaused).toHaveBeenCalled();
  });

  it('should throw when current issue target game does not exist', async () => {
    const { service, gameRepository } = createService();

    gameRepository.count.mockResolvedValue(0);

    await expect(service.getCurrentIssue(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should return current issue with server time', async () => {
    const { service, gameRepository, runtimeService } = createService();

    gameRepository.count.mockResolvedValue(1);
    runtimeService.findByGameId.mockResolvedValue({
      gameId: 1,
      currentIssue: '2026051900002',
      lastDrawAt: new Date('2026-05-19T08:01:00.000Z'),
      nextDrawAt: new Date('2026-05-19T08:02:00.000Z'),
      drawInterval: 60,
      status: 'idle',
    });

    const result = await service.getCurrentIssue(1);

    expect(result.gameId).toBe(1);
    expect(result.currentIssue).toBe('2026051900002');
    expect(result.nextDrawAt).toBe('2026-05-19T08:02:00.000Z');
    expect(result.serverTime).toEqual(expect.any(String));

    const parsedServerTime = Date.parse(String(result.serverTime));
    expect(Number.isNaN(parsedServerTime)).toBe(false);
  });
});
