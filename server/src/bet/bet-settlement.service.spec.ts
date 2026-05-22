import { DataSource } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { BetSettlementService } from './bet-settlement.service';
import { BetOrderEntity } from './entities/bet-order.entity';
import { BetItemEntity } from './entities/bet-item.entity';

describe('BetSettlementService', () => {
  const createService = () => {
    const orderRepository = {
      createQueryBuilder: jest.fn(),
      save: jest.fn(),
    };
    const itemRepository = {
      save: jest.fn(),
    };
    const userRepository = {
      save: jest.fn(),
    };
    const manager = {
      getRepository: jest.fn((entity: unknown) => {
        if (entity === BetOrderEntity) {
          return orderRepository;
        }

        if (entity === BetItemEntity) {
          return itemRepository;
        }

        if (entity === UserEntity) {
          return userRepository;
        }

        return null;
      }),
    };
    const dataSource = {
      transaction: jest.fn((handler: (input: typeof manager) => unknown) =>
        Promise.resolve(handler(manager)),
      ),
    };
    const usersService = {
      emitWalletBalanceUpdated: jest.fn(),
    };
    const service = new BetSettlementService(
      dataSource as unknown as DataSource,
      usersService as never,
    );

    return {
      service,
      dataSource,
      manager,
      orderRepository,
      itemRepository,
      userRepository,
      usersService,
    };
  };

  it('should settle placed orders and pay winning bets', async () => {
    const { service, orderRepository, itemRepository, userRepository } =
      createService();

    const winningUser = Object.assign(new UserEntity(), {
      id: 7,
      rechargeAmount: 100,
      bonusAmount: 20,
    });
    const winningItem = Object.assign(new BetItemEntity(), {
      id: 101,
      itemIndex: 1,
      betType: 'p5-single-number',
      displayText: '1 2 3 4 5',
      amount: 10,
      estimatedPayout: 19.8,
      estimatedProfit: 9.8,
      selectionPayload: { digits: [1, 2, 3, 4, 5] },
      extraPayload: null,
    });
    const losingItem = Object.assign(new BetItemEntity(), {
      id: 102,
      itemIndex: 2,
      betType: 'p5-single-number',
      displayText: '9 9 9 9 9',
      amount: 12,
      estimatedPayout: 23.76,
      estimatedProfit: 11.76,
      selectionPayload: { digits: [9, 9, 9, 9, 9] },
      extraPayload: null,
    });
    const order = Object.assign(new BetOrderEntity(), {
      id: 88,
      betStrategyKey: 'p5',
      status: 'placed',
      fixedOddsSnapshot: 1.98,
      payoutAmount: 0,
      settlementOpenCode: null,
      settledAt: null,
      user: winningUser,
      items: [winningItem, losingItem],
    });

    orderRepository.createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([order]),
    });

    const result = await service.settleOrdersForDraw({
      gameId: 1,
      issueNo: '2026051900001',
      openCode: '1,2,3,4,5',
      openCodeJson: [1, 2, 3, 4, 5],
    });

    expect(result).toEqual({
      settledOrderCount: 1,
      settledItemCount: 2,
      totalPayoutAmount: 19.8,
    });
    expect(order.status).toBe('settled');
    expect(order.isWinning).toBe(true);
    expect(order.payoutAmount).toBe(19.8);
    expect(order.settlementOpenCode).toBe('1,2,3,4,5');
    expect(winningItem.isWinning).toBe(true);
    expect(winningItem.payoutAmount).toBe(19.8);
    expect(losingItem.isWinning).toBe(false);
    expect(losingItem.payoutAmount).toBe(0);
    expect(winningUser.rechargeAmount).toBe(119.8);
    expect(itemRepository.save).toHaveBeenCalledWith([winningItem, losingItem]);
    expect(userRepository.save).toHaveBeenCalledWith([winningUser]);
  });

  it('should skip settlement when draw digits are invalid', async () => {
    const { service, dataSource } = createService();

    const result = await service.settleOrdersForDraw({
      gameId: 1,
      issueNo: '2026051900001',
      openCode: 'invalid',
      openCodeJson: null,
    });

    expect(result).toEqual({
      settledOrderCount: 0,
      settledItemCount: 0,
      totalPayoutAmount: 0,
    });
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('should settle sb exact-match orders', async () => {
    const { service, orderRepository, itemRepository, userRepository } =
      createService();

    const winningUser = Object.assign(new UserEntity(), {
      id: 8,
      rechargeAmount: 50,
      bonusAmount: 0,
    });
    const winningItem = Object.assign(new BetItemEntity(), {
      id: 201,
      itemIndex: 1,
      betType: 'sb-single-dice',
      displayText: '2 4 6',
      amount: 10,
      estimatedPayout: 19.8,
      estimatedProfit: 9.8,
      selectionPayload: { digits: [2, 4, 6] },
      extraPayload: null,
    });
    const order = Object.assign(new BetOrderEntity(), {
      id: 99,
      betStrategyKey: 'sb',
      status: 'placed',
      fixedOddsSnapshot: 1.98,
      payoutAmount: 0,
      settlementOpenCode: null,
      settledAt: null,
      user: winningUser,
      items: [winningItem],
    });

    orderRepository.createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([order]),
    });

    const result = await service.settleOrdersForDraw({
      gameId: 2,
      issueNo: '2026052200002',
      openCode: '2,4,6',
      openCodeJson: [2, 4, 6],
    });

    expect(result.totalPayoutAmount).toBe(19.8);
    expect(order.isWinning).toBe(true);
    expect(winningItem.isWinning).toBe(true);
    expect(winningUser.rechargeAmount).toBe(69.8);
    expect(itemRepository.save).toHaveBeenCalledWith([winningItem]);
    expect(userRepository.save).toHaveBeenCalledWith([winningUser]);
  });

  it('should settle sb big-small orders and skip triples', async () => {
    const { service, orderRepository, itemRepository, userRepository } =
      createService();

    const winningUser = Object.assign(new UserEntity(), {
      id: 18,
      rechargeAmount: 80,
      bonusAmount: 0,
    });
    const winningItem = Object.assign(new BetItemEntity(), {
      id: 301,
      itemIndex: 1,
      betType: 'sb-big-small',
      displayText: '大',
      amount: 10,
      estimatedPayout: 19.8,
      estimatedProfit: 9.8,
      selectionPayload: { size: 'big' },
      extraPayload: null,
    });
    const order = Object.assign(new BetOrderEntity(), {
      id: 109,
      betStrategyKey: 'sb',
      status: 'placed',
      fixedOddsSnapshot: 1.98,
      payoutAmount: 0,
      settlementOpenCode: null,
      settledAt: null,
      user: winningUser,
      items: [winningItem],
    });

    orderRepository.createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([order]),
    });

    const result = await service.settleOrdersForDraw({
      gameId: 2,
      issueNo: '2026052200003',
      openCode: '4,5,6',
      openCodeJson: [4, 5, 6],
    });

    expect(result.totalPayoutAmount).toBe(19.8);
    expect(order.isWinning).toBe(true);
    expect(winningItem.isWinning).toBe(true);
    expect(winningUser.rechargeAmount).toBe(99.8);
    expect(itemRepository.save).toHaveBeenCalledWith([winningItem]);
    expect(userRepository.save).toHaveBeenCalledWith([winningUser]);

    order.status = 'placed';
    order.isWinning = null;
    order.payoutAmount = 0;
    winningItem.isWinning = null;
    winningItem.payoutAmount = 0;
    winningUser.rechargeAmount = 80;

    await service.settleOrdersForDraw({
      gameId: 2,
      issueNo: '2026052200003',
      openCode: '6,6,6',
      openCodeJson: [6, 6, 6],
    });

    expect(order.isWinning).toBe(false);
    expect(winningItem.isWinning).toBe(false);
    expect(winningItem.payoutAmount).toBe(0);
  });

  it('should settle roulette single-number orders', async () => {
    const { service, orderRepository, itemRepository, userRepository } =
      createService();

    const winningUser = Object.assign(new UserEntity(), {
      id: 28,
      rechargeAmount: 40,
      bonusAmount: 0,
    });
    const winningItem = Object.assign(new BetItemEntity(), {
      id: 401,
      itemIndex: 1,
      betType: 'roulette-single-number',
      displayText: '17',
      amount: 10,
      estimatedPayout: 350,
      estimatedProfit: 340,
      selectionPayload: { digits: [17] },
      extraPayload: null,
    });
    const order = Object.assign(new BetOrderEntity(), {
      id: 209,
      betStrategyKey: 'roulette',
      status: 'placed',
      fixedOddsSnapshot: 35,
      payoutAmount: 0,
      settlementOpenCode: null,
      settledAt: null,
      user: winningUser,
      items: [winningItem],
    });

    orderRepository.createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([order]),
    });

    const result = await service.settleOrdersForDraw({
      gameId: 3,
      issueNo: '2026052200004',
      openCode: '17',
      openCodeJson: [17],
    });

    expect(result.totalPayoutAmount).toBe(350);
    expect(order.isWinning).toBe(true);
    expect(winningItem.isWinning).toBe(true);
    expect(winningItem.payoutAmount).toBe(350);
    expect(winningUser.rechargeAmount).toBe(390);
    expect(itemRepository.save).toHaveBeenCalledWith([winningItem]);
    expect(userRepository.save).toHaveBeenCalledWith([winningUser]);
  });
});
