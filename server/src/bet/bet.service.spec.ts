import { BetService } from './bet.service';
import { GameOddsMode } from '../game/enums/game-odds-mode.enum';
import { GameType } from '../game/enums/game-type.enum';
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
});
