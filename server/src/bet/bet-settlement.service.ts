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

    if (order.betStrategyKey !== 'p5') {
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
      digits.some((digit) => !Number.isInteger(digit) || digit < 0 || digit > 9)
    ) {
      return [];
    }

    return digits;
  }

  private roundCurrency(value: number) {
    return Number(value.toFixed(2));
  }
}
