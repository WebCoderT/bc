import { BetService } from './bet.service';
import { GameOddsMode } from '../game/enums/game-odds-mode.enum';
import { GameType } from '../game/enums/game-type.enum';
import { RealtimeEventsService } from '../realtime/realtime-events.service';
import { BetOrderEntity } from './entities/bet-order.entity';
import { BetItemEntity } from './entities/bet-item.entity';
import { UserEntity } from '../users/entities/user.entity';

describe('BetService', () => {
  it('should set settlement defaults when creating a bet order and items', async () => {
    const transactionalUserRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        rechargeAmount: 100,
        bonusAmount: 0,
      }),
      save: jest.fn(),
    };
    const transactionalOrderRepository = {
      create: jest.fn((payload: Record<string, unknown>) => payload),
      save: jest.fn((payload: Record<string, unknown>) =>
        Promise.resolve({ ...payload, id: 12 }),
      ),
    };
    const transactionalItemRepository = {
      create: jest.fn((payload: Record<string, unknown>) => payload),
      save: jest.fn(),
    };
    const dataSource = {
      transaction: jest.fn(
        (
          handler: (manager: {
            getRepository: (entity: unknown) => unknown;
          }) => unknown,
        ) =>
          Promise.resolve(
            handler({
              getRepository: (entity: unknown) => {
                if (entity === UserEntity) {
                  return transactionalUserRepository;
                }

                if (entity === BetOrderEntity) {
                  return transactionalOrderRepository;
                }

                if (entity === BetItemEntity) {
                  return transactionalItemRepository;
                }

                return null;
              },
            }),
          ),
      ),
    };
    const betOrderRepository = {};
    const gameRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 9,
        label: 'P5',
        description: 'P5 游戏',
        gameModelId: 'p5',
        status: GameType.ONLINE,
        oddsMode: GameOddsMode.FIXED,
        fixedOdds: 1.98,
        gameModel: { id: 'p5' },
      }),
    };
    const userRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        rechargeAmount: 100,
        bonusAmount: 0,
      }),
    };

    const service = new BetService(
      dataSource as never,
      { emitWalletBalanceUpdated: jest.fn() } as never,
      { emitBetPlaced: jest.fn() } as never,
      betOrderRepository as never,
      gameRepository as never,
      userRepository as never,
    );

    jest.spyOn(service as never, 'findOrderById' as never).mockResolvedValue({
      id: 12,
      gameId: 9,
      gameLabelSnapshot: 'P5',
      betStrategyKey: 'p5',
      issueNo: '2026051900301',
      status: 'placed',
      totalAmount: 10,
      itemCount: 1,
      estimatedPayout: 19.8,
      estimatedProfit: 9.8,
      oddsSnapshotText: '固定赔率 1.98',
      selectionSummary: '1 2 3 4 5',
      isWinning: null,
      payoutAmount: 0,
      settlementOpenCode: null,
      settledAt: null,
      placedAt: new Date('2026-05-19T08:00:00.000Z'),
      items: [
        {
          id: 100,
          itemIndex: 1,
          betType: 'p5-single-number',
          displayText: '1 2 3 4 5',
          amount: 10,
          estimatedPayout: 19.8,
          estimatedProfit: 9.8,
          selectionPayload: { digits: [1, 2, 3, 4, 5], source: 'manual' },
          extraPayload: null,
          isWinning: null,
          payoutAmount: 0,
          settledAt: null,
          createdAt: new Date('2026-05-19T08:00:00.000Z'),
        },
      ],
    } as never);

    await service.createMemberBet(1, 9, {
      issueNo: '2026051900301',
      items: [
        {
          displayText: '1 2 3 4 5',
          betType: 'p5-single-number',
          amount: 10,
          selection: { digits: [1, 2, 3, 4, 5], source: 'manual' },
        },
      ],
    });

    expect(transactionalOrderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        isWinning: null,
        payoutAmount: 0,
        settlementOpenCode: null,
        settledAt: null,
      }),
    );
    expect(transactionalItemRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        isWinning: null,
        payoutAmount: 0,
        settledAt: null,
      }),
    );
  });

  it('should normalize sb dice selection with exact-match defaults', async () => {
    const transactionalUserRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        rechargeAmount: 100,
        bonusAmount: 0,
      }),
      save: jest.fn(),
    };
    const transactionalOrderRepository = {
      create: jest.fn((payload: Record<string, unknown>) => payload),
      save: jest.fn((payload: Record<string, unknown>) =>
        Promise.resolve({ ...payload, id: 13 }),
      ),
    };
    const transactionalItemRepository = {
      create: jest.fn((payload: Record<string, unknown>) => payload),
      save: jest.fn(),
    };
    const dataSource = {
      transaction: jest.fn(
        (
          handler: (manager: {
            getRepository: (entity: unknown) => unknown;
          }) => unknown,
        ) =>
          Promise.resolve(
            handler({
              getRepository: (entity: unknown) => {
                if (entity === UserEntity) {
                  return transactionalUserRepository;
                }

                if (entity === BetOrderEntity) {
                  return transactionalOrderRepository;
                }

                if (entity === BetItemEntity) {
                  return transactionalItemRepository;
                }

                return null;
              },
            }),
          ),
      ),
    };
    const gameRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 10,
        label: '筛宝',
        description: '筛宝游戏',
        gameModelId: 'sb',
        status: GameType.ONLINE,
        oddsMode: GameOddsMode.FIXED,
        fixedOdds: 1.98,
        gameModel: { id: 'sb' },
      }),
    };
    const userRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        rechargeAmount: 100,
        bonusAmount: 0,
      }),
    };
    const realtimeEventsService = {
      emitBetPlaced: jest.fn(),
    } as unknown as RealtimeEventsService;
    const usersService = {
      emitWalletBalanceUpdated: jest.fn(),
    };

    const service = new BetService(
      dataSource as never,
      usersService as never,
      realtimeEventsService as never,
      {} as never,
      gameRepository as never,
      userRepository as never,
    );

    jest.spyOn(service as never, 'findOrderById' as never).mockResolvedValue({
      id: 13,
      gameId: 10,
      gameLabelSnapshot: '筛宝',
      betStrategyKey: 'sb',
      issueNo: '2026052200001',
      status: 'placed',
      totalAmount: 10,
      itemCount: 1,
      estimatedPayout: 19.8,
      estimatedProfit: 9.8,
      oddsSnapshotText: '固定赔率 1.98',
      selectionSummary: '1 2 6',
      isWinning: null,
      payoutAmount: 0,
      settlementOpenCode: null,
      settledAt: null,
      placedAt: new Date('2026-05-22T08:00:00.000Z'),
      items: [],
    } as never);

    await service.createMemberBet(1, 10, {
      issueNo: '2026052200001',
      items: [
        {
          displayText: '1 2 6',
          amount: 10,
          selection: { digits: [1, 2, 6], source: 'manual' },
        },
      ],
    });

    expect(transactionalItemRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        betType: 'sb-single-dice',
        displayText: '1 2 6',
        selectionPayload: expect.objectContaining({
          digits: [1, 2, 6],
          source: 'manual',
        }),
      }),
    );
  });

  it('should normalize sb sum selection', async () => {
    const transactionalUserRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        rechargeAmount: 100,
        bonusAmount: 0,
      }),
      save: jest.fn(),
    };
    const transactionalOrderRepository = {
      create: jest.fn((payload: Record<string, unknown>) => payload),
      save: jest.fn((payload: Record<string, unknown>) =>
        Promise.resolve({ ...payload, id: 14 }),
      ),
    };
    const transactionalItemRepository = {
      create: jest.fn((payload: Record<string, unknown>) => payload),
      save: jest.fn(),
    };
    const dataSource = {
      transaction: jest.fn(
        (
          handler: (manager: {
            getRepository: (entity: unknown) => unknown;
          }) => unknown,
        ) =>
          Promise.resolve(
            handler({
              getRepository: (entity: unknown) => {
                if (entity === UserEntity) {
                  return transactionalUserRepository;
                }

                if (entity === BetOrderEntity) {
                  return transactionalOrderRepository;
                }

                if (entity === BetItemEntity) {
                  return transactionalItemRepository;
                }

                return null;
              },
            }),
          ),
      ),
    };
    const gameRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 10,
        label: '筛宝',
        description: '筛宝游戏',
        gameModelId: 'sb',
        status: GameType.ONLINE,
        oddsMode: GameOddsMode.FIXED,
        fixedOdds: 1.98,
        gameModel: { id: 'sb' },
      }),
    };
    const userRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        rechargeAmount: 100,
        bonusAmount: 0,
      }),
    };

    const service = new BetService(
      dataSource as never,
      { emitWalletBalanceUpdated: jest.fn() } as never,
      { emitBetPlaced: jest.fn() } as unknown as RealtimeEventsService,
      {} as never,
      gameRepository as never,
      userRepository as never,
    );

    jest.spyOn(service as never, 'findOrderById' as never).mockResolvedValue({
      id: 14,
      gameId: 10,
      gameLabelSnapshot: '筛宝',
      betStrategyKey: 'sb',
      issueNo: '2026052200002',
      status: 'placed',
      totalAmount: 10,
      itemCount: 1,
      estimatedPayout: 19.8,
      estimatedProfit: 9.8,
      oddsSnapshotText: '固定赔率 1.98',
      selectionSummary: '和值 10',
      isWinning: null,
      payoutAmount: 0,
      settlementOpenCode: null,
      settledAt: null,
      placedAt: new Date('2026-05-22T08:01:00.000Z'),
      items: [],
    } as never);

    await service.createMemberBet(1, 10, {
      issueNo: '2026052200002',
      items: [
        {
          displayText: '和值 10',
          betType: 'sb-sum',
          amount: 10,
          selection: { sum: 10 },
        },
      ],
    });

    expect(transactionalItemRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        betType: 'sb-sum',
        displayText: '和值 10',
        selectionPayload: { sum: 10 },
      }),
    );
  });

  it('should normalize roulette single-number selection', async () => {
    const transactionalUserRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        rechargeAmount: 100,
        bonusAmount: 0,
      }),
      save: jest.fn(),
    };
    const transactionalOrderRepository = {
      create: jest.fn((payload: Record<string, unknown>) => payload),
      save: jest.fn((payload: Record<string, unknown>) =>
        Promise.resolve({ ...payload, id: 15 }),
      ),
    };
    const transactionalItemRepository = {
      create: jest.fn((payload: Record<string, unknown>) => payload),
      save: jest.fn(),
    };
    const dataSource = {
      transaction: jest.fn(
        (
          handler: (manager: {
            getRepository: (entity: unknown) => unknown;
          }) => unknown,
        ) =>
          Promise.resolve(
            handler({
              getRepository: (entity: unknown) => {
                if (entity === UserEntity) {
                  return transactionalUserRepository;
                }

                if (entity === BetOrderEntity) {
                  return transactionalOrderRepository;
                }

                if (entity === BetItemEntity) {
                  return transactionalItemRepository;
                }

                return null;
              },
            }),
          ),
      ),
    };
    const gameRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 11,
        label: '轮盘',
        description: '轮盘游戏',
        gameModelId: 'roulette',
        status: GameType.ONLINE,
        oddsMode: GameOddsMode.CUSTOM,
        fixedOdds: null,
        customPayoutConfig: {
          single: 36,
          color: 2,
          parity: 2,
          range: 2,
          dozen: 3,
          column: 3,
        },
        gameModel: { id: 'roulette' },
      }),
    };
    const userRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        rechargeAmount: 100,
        bonusAmount: 0,
      }),
    };

    const service = new BetService(
      dataSource as never,
      { emitWalletBalanceUpdated: jest.fn() } as never,
      { emitBetPlaced: jest.fn() } as unknown as RealtimeEventsService,
      {} as never,
      gameRepository as never,
      userRepository as never,
    );

    jest.spyOn(service as never, 'findOrderById' as never).mockResolvedValue({
      id: 15,
      gameId: 11,
      gameLabelSnapshot: '轮盘',
      betStrategyKey: 'roulette',
      issueNo: '2026052200003',
      status: 'placed',
      totalAmount: 10,
      itemCount: 1,
      estimatedPayout: 360,
      estimatedProfit: 350,
      oddsSnapshotText:
        '单号 36.00 · 红黑 2.00 · 单双 2.00 · 大小 2.00 · 组 3.00 · 列 3.00',
      selectionSummary: '17',
      isWinning: null,
      payoutAmount: 0,
      settlementOpenCode: null,
      settledAt: null,
      placedAt: new Date('2026-05-22T08:02:00.000Z'),
      items: [],
    } as never);

    await service.createMemberBet(1, 11, {
      issueNo: '2026052200003',
      items: [
        {
          displayText: '17',
          amount: 10,
          selection: { digits: [17], source: 'manual' },
        },
      ],
    });

    expect(transactionalItemRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        betType: 'roulette-single-number',
        displayText: '17',
        selectionPayload: expect.objectContaining({
          digits: [17],
        }),
      }),
    );
  });

  it('should normalize roulette color selection', async () => {
    const transactionalUserRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        rechargeAmount: 100,
        bonusAmount: 0,
      }),
      save: jest.fn(),
    };
    const transactionalOrderRepository = {
      create: jest.fn((payload: Record<string, unknown>) => payload),
      save: jest.fn((payload: Record<string, unknown>) =>
        Promise.resolve({ ...payload, id: 16 }),
      ),
    };
    const transactionalItemRepository = {
      create: jest.fn((payload: Record<string, unknown>) => payload),
      save: jest.fn(),
    };
    const dataSource = {
      transaction: jest.fn(
        (
          handler: (manager: {
            getRepository: (entity: unknown) => unknown;
          }) => unknown,
        ) =>
          Promise.resolve(
            handler({
              getRepository: (entity: unknown) => {
                if (entity === UserEntity) {
                  return transactionalUserRepository;
                }

                if (entity === BetOrderEntity) {
                  return transactionalOrderRepository;
                }

                if (entity === BetItemEntity) {
                  return transactionalItemRepository;
                }

                return null;
              },
            }),
          ),
      ),
    };
    const gameRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 11,
        label: '轮盘',
        description: '轮盘游戏',
        gameModelId: 'roulette',
        status: GameType.ONLINE,
        oddsMode: GameOddsMode.CUSTOM,
        fixedOdds: null,
        customPayoutConfig: {
          single: 36,
          color: 2,
          parity: 2,
          range: 2,
          dozen: 3,
          column: 3,
        },
        gameModel: { id: 'roulette' },
      }),
    };
    const userRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        rechargeAmount: 100,
        bonusAmount: 0,
      }),
    };

    const service = new BetService(
      dataSource as never,
      { emitWalletBalanceUpdated: jest.fn() } as never,
      { emitBetPlaced: jest.fn() } as unknown as RealtimeEventsService,
      {} as never,
      gameRepository as never,
      userRepository as never,
    );

    jest.spyOn(service as never, 'findOrderById' as never).mockResolvedValue({
      id: 16,
      gameId: 11,
      gameLabelSnapshot: '轮盘',
      betStrategyKey: 'roulette',
      issueNo: '2026052200004',
      status: 'placed',
      totalAmount: 10,
      itemCount: 1,
      estimatedPayout: 20,
      estimatedProfit: 10,
      oddsSnapshotText:
        '单号 36.00 · 红黑 2.00 · 单双 2.00 · 大小 2.00 · 组 3.00 · 列 3.00',
      selectionSummary: '红',
      isWinning: null,
      payoutAmount: 0,
      settlementOpenCode: null,
      settledAt: null,
      placedAt: new Date('2026-05-22T08:03:00.000Z'),
      items: [],
    } as never);

    await service.createMemberBet(1, 11, {
      issueNo: '2026052200004',
      items: [
        {
          displayText: '红',
          betType: 'roulette-color',
          amount: 10,
          selection: { color: 'red' },
        },
      ],
    });

    expect(transactionalItemRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        betType: 'roulette-color',
        displayText: '红',
        selectionPayload: {
          color: 'red',
        },
      }),
    );
  });
});
