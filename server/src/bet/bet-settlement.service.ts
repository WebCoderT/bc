import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { BetOrderStatus } from './enums/bet-order-status.enum';
import { BetOrderEntity } from './entities/bet-order.entity';
import { BetItemEntity } from './entities/bet-item.entity';

type DrawSettlementInput = {
  gameId: number;
  issueNo: string;
  openCode: string;
  openCodeJson: unknown;
};

type SettledBetItem = {
  item: BetItemEntity;
  isWinning: boolean;
  payoutAmount: number;
};

const EXACT_MATCH_STRATEGY_KEYS = new Set(['p5', 'p3', 'roulette']);
const ROULETTE_RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

@Injectable()
export class BetSettlementService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
  ) {}

  async settleOrdersForDraw(input: DrawSettlementInput) {
    const drawDigits = this.normalizeDrawDigits(input.openCodeJson);

    if (drawDigits.length === 0) {
      return {
        settledOrderCount: 0,
        settledItemCount: 0,
        totalPayoutAmount: 0,
      };
    }

    const settlementResult = await this.dataSource.transaction(
      async (manager) => {
        const orderRepository = manager.getRepository(BetOrderEntity);
        const itemRepository = manager.getRepository(BetItemEntity);
        const userRepository = manager.getRepository(UserEntity);

        const orders = await orderRepository
          .createQueryBuilder('bet')
          .leftJoinAndSelect('bet.user', 'user')
          .leftJoin('bet.game', 'game')
          .leftJoinAndSelect('bet.items', 'item')
          .where('game.id = :gameId', { gameId: input.gameId })
          .andWhere('bet.issueNo = :issueNo', { issueNo: input.issueNo })
          .andWhere('bet.status = :status', { status: BetOrderStatus.PLACED })
          .orderBy('bet.id', 'ASC')
          .addOrderBy('item.itemIndex', 'ASC')
          .getMany();

        if (orders.length === 0) {
          return {
            settledOrderCount: 0,
            settledItemCount: 0,
            totalPayoutAmount: 0,
            walletUpdates: [] as Array<{
              user: UserEntity;
              changeAmount: number;
            }>,
          };
        }

        const settledAt = new Date();
        const usersToUpdate = new Map<number, UserEntity>();
        const itemsToSave: BetItemEntity[] = [];
        const ordersToSave: BetOrderEntity[] = [];
        let settledItemCount = 0;
        let totalPayoutAmount = 0;
        const walletUpdates: Array<{ user: UserEntity; changeAmount: number }> =
          [];

        for (const order of orders) {
          const settledItems = (order.items ?? []).map((item) =>
            this.evaluateItemSettlement(order, item, drawDigits),
          );
          const payoutAmount = this.roundCurrency(
            settledItems.reduce((sum, entry) => sum + entry.payoutAmount, 0),
          );
          const isWinning = settledItems.some((entry) => entry.isWinning);

          for (const settledItem of settledItems) {
            settledItem.item.isWinning = settledItem.isWinning;
            settledItem.item.payoutAmount = settledItem.payoutAmount;
            settledItem.item.settledAt = settledAt;
            itemsToSave.push(settledItem.item);
          }

          order.status = BetOrderStatus.SETTLED;
          order.isWinning = isWinning;
          order.payoutAmount = payoutAmount;
          order.settlementOpenCode = input.openCode;
          order.settledAt = settledAt;
          ordersToSave.push(order);

          if (payoutAmount > 0 && order.user) {
            const nextUser = usersToUpdate.get(order.user.id) ?? order.user;
            nextUser.rechargeAmount = this.roundCurrency(
              Number(nextUser.rechargeAmount ?? 0) + payoutAmount,
            );
            usersToUpdate.set(nextUser.id, nextUser);
            walletUpdates.push({ user: nextUser, changeAmount: payoutAmount });
          }

          totalPayoutAmount = this.roundCurrency(
            totalPayoutAmount + payoutAmount,
          );
          settledItemCount += settledItems.length;
        }

        if (itemsToSave.length > 0) {
          await itemRepository.save(itemsToSave);
        }

        if (ordersToSave.length > 0) {
          await orderRepository.save(ordersToSave);
        }

        if (usersToUpdate.size > 0) {
          await userRepository.save([...usersToUpdate.values()]);
        }

        return {
          settledOrderCount: orders.length,
          settledItemCount,
          totalPayoutAmount,
          walletUpdates,
        };
      },
    );

    settlementResult.walletUpdates.forEach(({ user, changeAmount }) => {
      this.usersService.emitWalletBalanceUpdated(
        user,
        changeAmount,
        'bet-settled',
      );
    });

    return {
      settledOrderCount: settlementResult.settledOrderCount,
      settledItemCount: settlementResult.settledItemCount,
      totalPayoutAmount: settlementResult.totalPayoutAmount,
    };
  }

  private evaluateItemSettlement(
    order: BetOrderEntity,
    item: BetItemEntity,
    drawDigits: number[],
  ): SettledBetItem {
    const isWinning = this.isWinningSelection(order, item, drawDigits);
    const payoutAmount = isWinning ? this.resolvePayoutAmount(order, item) : 0;

    return {
      item,
      isWinning,
      payoutAmount,
    };
  }

  private isWinningSelection(
    order: BetOrderEntity,
    item: BetItemEntity,
    drawDigits: number[],
  ) {
    if (order.betStrategyKey === 'lhd') {
      const selectedSide =
        typeof item.selectionPayload?.side === 'string'
          ? item.selectionPayload.side
          : '';

      if (drawDigits.length < 2) {
        return false;
      }

      const winner =
        drawDigits[0] === drawDigits[1]
          ? 'tie'
          : drawDigits[0] > drawDigits[1]
            ? 'dragon'
            : 'tiger';

      return selectedSide === winner;
    }

    if (order.betStrategyKey === 'sb') {
      const sum = drawDigits.reduce((total, value) => total + value, 0);
      const isTriple =
        drawDigits.length === 3 &&
        drawDigits.every((value) => value === drawDigits[0]);

      if (item.betType === 'sb-sum') {
        const selectedSum = Number(item.selectionPayload?.sum);

        return Number.isInteger(selectedSum) && selectedSum === sum;
      }

      if (item.betType === 'sb-big-small') {
        const selectedSize =
          typeof item.selectionPayload?.size === 'string'
            ? item.selectionPayload.size.toLowerCase()
            : '';

        if (isTriple) {
          return false;
        }

        if (selectedSize === 'big') {
          return sum >= 11 && sum <= 17;
        }

        if (selectedSize === 'small') {
          return sum >= 4 && sum <= 10;
        }

        return false;
      }

      if (item.betType === 'sb-odd-even') {
        const selectedParity =
          typeof item.selectionPayload?.parity === 'string'
            ? item.selectionPayload.parity.toLowerCase()
            : '';

        if (isTriple) {
          return false;
        }

        if (selectedParity === 'odd') {
          return sum % 2 === 1;
        }

        if (selectedParity === 'even') {
          return sum % 2 === 0;
        }

        return false;
      }

      if (item.betType === 'sb-triple-any') {
        return isTriple;
      }

      if (item.betType !== 'sb-single-dice') {
        return false;
      }

      const selectedDigits = item.selectionPayload?.digits;

      if (!Array.isArray(selectedDigits) || selectedDigits.length !== 3) {
        return false;
      }

      return selectedDigits.every(
        (digit, index) => Number(digit) === drawDigits[index],
      );
    }

    if (order.betStrategyKey === 'roulette') {
      const drawNumber = drawDigits[0];

      if (!Number.isInteger(drawNumber) || drawNumber < 0 || drawNumber > 36) {
        return false;
      }

      if (item.betType === 'roulette-color') {
        const selectedColor =
          typeof item.selectionPayload?.color === 'string'
            ? item.selectionPayload.color.toLowerCase()
            : '';

        if (drawNumber === 0) {
          return false;
        }

        if (selectedColor === 'red') {
          return ROULETTE_RED_NUMBERS.has(drawNumber);
        }

        if (selectedColor === 'black') {
          return !ROULETTE_RED_NUMBERS.has(drawNumber);
        }

        return false;
      }

      if (item.betType === 'roulette-parity') {
        const selectedParity =
          typeof item.selectionPayload?.parity === 'string'
            ? item.selectionPayload.parity.toLowerCase()
            : '';

        if (drawNumber === 0) {
          return false;
        }

        if (selectedParity === 'odd') {
          return drawNumber % 2 === 1;
        }

        if (selectedParity === 'even') {
          return drawNumber % 2 === 0;
        }

        return false;
      }

      if (item.betType === 'roulette-range') {
        const selectedRange =
          typeof item.selectionPayload?.range === 'string'
            ? item.selectionPayload.range.toLowerCase()
            : '';

        if (selectedRange === 'low') {
          return drawNumber >= 1 && drawNumber <= 18;
        }

        if (selectedRange === 'high') {
          return drawNumber >= 19 && drawNumber <= 36;
        }

        return false;
      }

      if (item.betType === 'roulette-dozen') {
        const selectedDozen = Number(item.selectionPayload?.dozen);

        if (
          !Number.isInteger(selectedDozen) ||
          selectedDozen < 1 ||
          selectedDozen > 3
        ) {
          return false;
        }

        if (drawNumber === 0) {
          return false;
        }

        const min = (selectedDozen - 1) * 12 + 1;
        const max = selectedDozen * 12;

        return drawNumber >= min && drawNumber <= max;
      }

      if (item.betType === 'roulette-column') {
        const selectedColumn = Number(item.selectionPayload?.column);

        if (
          !Number.isInteger(selectedColumn) ||
          selectedColumn < 1 ||
          selectedColumn > 3
        ) {
          return false;
        }

        if (drawNumber === 0) {
          return false;
        }

        return ((drawNumber - 1) % 3) + 1 === selectedColumn;
      }
    }

    if (order.betStrategyKey === 'ssq') {
      const redDrawBalls = drawDigits
        .slice(0, 6)
        .sort((left, right) => left - right);
      const blueDrawBall = drawDigits[6];

      if (redDrawBalls.length !== 6) {
        return false;
      }

      if (
        redDrawBalls.some(
          (value) => !Number.isInteger(value) || value < 1 || value > 33,
        ) ||
        new Set(redDrawBalls).size !== 6
      ) {
        return false;
      }

      if (
        !Number.isInteger(blueDrawBall) ||
        blueDrawBall < 1 ||
        blueDrawBall > 16
      ) {
        return false;
      }

      const selectedRedBallsRaw = item.selectionPayload?.redBalls;
      const selectedBlueBall = Number(item.selectionPayload?.blueBall);

      if (
        !Array.isArray(selectedRedBallsRaw) ||
        selectedRedBallsRaw.length !== 6
      ) {
        return false;
      }

      const selectedRedBalls = selectedRedBallsRaw
        .map((value) => Number(value))
        .sort((left, right) => left - right);

      if (
        selectedRedBalls.some(
          (value) => !Number.isInteger(value) || value < 1 || value > 33,
        ) ||
        new Set(selectedRedBalls).size !== 6
      ) {
        return false;
      }

      if (
        !Number.isInteger(selectedBlueBall) ||
        selectedBlueBall < 1 ||
        selectedBlueBall > 16
      ) {
        return false;
      }

      return (
        selectedBlueBall === blueDrawBall &&
        selectedRedBalls.every((value, index) => value === redDrawBalls[index])
      );
    }

    if (order.betStrategyKey === 'dlt') {
      const frontDrawBalls = drawDigits
        .slice(0, 5)
        .sort((left, right) => left - right);
      const backDrawBalls = drawDigits
        .slice(5, 7)
        .sort((left, right) => left - right);

      if (frontDrawBalls.length !== 5 || backDrawBalls.length !== 2) {
        return false;
      }

      if (
        frontDrawBalls.some(
          (value) => !Number.isInteger(value) || value < 1 || value > 35,
        ) ||
        new Set(frontDrawBalls).size !== 5
      ) {
        return false;
      }

      if (
        backDrawBalls.some(
          (value) => !Number.isInteger(value) || value < 1 || value > 12,
        ) ||
        new Set(backDrawBalls).size !== 2
      ) {
        return false;
      }

      const selectedFrontBallsRaw = item.selectionPayload?.frontBalls;
      const selectedBackBallsRaw = item.selectionPayload?.backBalls;

      if (
        !Array.isArray(selectedFrontBallsRaw) ||
        selectedFrontBallsRaw.length < 5 ||
        !Array.isArray(selectedBackBallsRaw) ||
        selectedBackBallsRaw.length < 2
      ) {
        return false;
      }

      const selectedFrontBalls = selectedFrontBallsRaw
        .map((value) => Number(value))
        .sort((left, right) => left - right);
      const selectedBackBalls = selectedBackBallsRaw
        .map((value) => Number(value))
        .sort((left, right) => left - right);

      if (
        selectedFrontBalls.some(
          (value) => !Number.isInteger(value) || value < 1 || value > 35,
        ) ||
        new Set(selectedFrontBalls).size !== selectedFrontBalls.length
      ) {
        return false;
      }

      if (
        selectedBackBalls.some(
          (value) => !Number.isInteger(value) || value < 1 || value > 12,
        ) ||
        new Set(selectedBackBalls).size !== selectedBackBalls.length
      ) {
        return false;
      }

      if (
        item.betType === 'dlt-dantuo' ||
        item.betType === 'dlt-dantuo-additional'
      ) {
        const selectedFrontDanRaw = item.selectionPayload?.frontDan;
        const selectedBackDanRaw = item.selectionPayload?.backDan;

        if (
          !Array.isArray(selectedFrontDanRaw) ||
          !Array.isArray(selectedBackDanRaw)
        ) {
          return false;
        }

        const selectedFrontDan = selectedFrontDanRaw
          .map((value) => Number(value))
          .sort((left, right) => left - right);
        const selectedBackDan = selectedBackDanRaw
          .map((value) => Number(value))
          .sort((left, right) => left - right);

        if (
          selectedFrontDan.length < 1 ||
          selectedFrontDan.length > 4 ||
          selectedFrontDan.some(
            (value) => !Number.isInteger(value) || value < 1 || value > 35,
          ) ||
          new Set(selectedFrontDan).size !== selectedFrontDan.length
        ) {
          return false;
        }

        if (
          selectedBackDan.length > 1 ||
          selectedBackDan.some(
            (value) => !Number.isInteger(value) || value < 1 || value > 12,
          ) ||
          new Set(selectedBackDan).size !== selectedBackDan.length
        ) {
          return false;
        }

        const frontDanWinning = selectedFrontDan.every((value) =>
          frontDrawBalls.includes(value),
        );
        const backDanWinning = selectedBackDan.every((value) =>
          backDrawBalls.includes(value),
        );

        if (!frontDanWinning || !backDanWinning) {
          return false;
        }
      }

      return (
        frontDrawBalls.every((value) => selectedFrontBalls.includes(value)) &&
        backDrawBalls.every((value) => selectedBackBalls.includes(value))
      );
    }

    if (!EXACT_MATCH_STRATEGY_KEYS.has(order.betStrategyKey)) {
      return false;
    }

    const selectedDigits = item.selectionPayload?.digits;

    if (
      !Array.isArray(selectedDigits) ||
      selectedDigits.length !== drawDigits.length
    ) {
      return false;
    }

    return selectedDigits.every(
      (digit, index) => Number(digit) === drawDigits[index],
    );
  }

  private resolvePayoutAmount(order: BetOrderEntity, item: BetItemEntity) {
    if (item.estimatedPayout !== null) {
      return this.roundCurrency(Number(item.estimatedPayout));
    }

    if (order.fixedOddsSnapshot !== null) {
      return this.roundCurrency(
        Number(item.amount ?? 0) * Number(order.fixedOddsSnapshot),
      );
    }

    return 0;
  }

  private normalizeDrawDigits(openCodeJson: unknown) {
    if (!Array.isArray(openCodeJson)) {
      return [];
    }

    const digits = openCodeJson.map((digit) => Number(digit));

    if (
      digits.length === 0 ||
      digits.some((digit) => !Number.isInteger(digit) || digit < 0)
    ) {
      return [];
    }

    return digits;
  }

  private roundCurrency(value: number) {
    return Number(value.toFixed(2));
  }
}
