import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ApiPaginatedData } from '../common/interfaces/api-response.interface';
import { createPaginatedResult } from '../common/utils/pagination.util';
import { Game } from '../game/entities/game.entity';
import { GameOddsMode } from '../game/enums/game-odds-mode.enum';
import { GameType } from '../game/enums/game-type.enum';
import { RealtimeEventsService } from '../realtime/realtime-events.service';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { BetOrderEntity } from './entities/bet-order.entity';
import { BetItemEntity } from './entities/bet-item.entity';
import {
  CreateMemberBetDto,
  CreateMemberBetItemDto,
} from './dto/create-member-bet.dto';
import { QueryBetsDto } from './dto/query-bets.dto';
import { BetOrderResponseDto } from './dto/bet-order-response.dto';

type NormalizedBetItem = {
  itemIndex: number;
  betType: string;
  displayText: string;
  amount: number;
  selection: Record<string, unknown>;
  extraPayload: Record<string, unknown> | null;
  estimatedPayout: number | null;
  estimatedProfit: number | null;
};

const EXACT_MATCH_GAME_CONFIGS = {
  p5: {
    digits: 5,
    min: 0,
    max: 9,
    betType: 'p5-single-number',
    invalidLengthMessage: 'P5 下注必须提供 5 位数字',
    invalidRangeMessage: 'P5 下注号码仅支持 0-9 的五位数字',
  },
  p3: {
    digits: 3,
    min: 0,
    max: 9,
    betType: 'p3-single-number',
    invalidLengthMessage: 'P3 下注必须提供 3 位数字',
    invalidRangeMessage: 'P3 下注号码仅支持 0-9 的三位数字',
  },
  sb: {
    digits: 3,
    min: 1,
    max: 6,
    betType: 'sb-single-dice',
    invalidLengthMessage: '筛宝下注必须提供 3 个筛子点数',
    invalidRangeMessage: '筛宝下注号码仅支持 1-6 的三颗筛子点数',
  },
} as const;

const SB_SIZE_OPTIONS = new Set(['big', 'small']);
const SB_PARITY_OPTIONS = new Set(['odd', 'even']);

@Injectable()
export class BetService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly realtimeEventsService: RealtimeEventsService,
    @InjectRepository(BetOrderEntity)
    private readonly betOrderRepository: Repository<BetOrderEntity>,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createMemberBet(
    userId: number,
    gameId: number,
    input: CreateMemberBetDto,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['gameModel'],
    });

    if (!game) {
      throw new NotFoundException('游戏不存在');
    }

    if (game.status !== GameType.ONLINE) {
      throw new ForbiddenException('当前游戏暂不支持下注');
    }

    const normalizedItems = input.items.map((item, index) =>
      this.normalizeBetItem(game, item, index),
    );
    const totalAmount = this.roundCurrency(
      normalizedItems.reduce((sum, item) => sum + item.amount, 0),
    );
    const totalBalance = this.roundCurrency(
      Number(user.rechargeAmount ?? 0) + Number(user.bonusAmount ?? 0),
    );

    if (totalAmount > totalBalance) {
      throw new BadRequestException('账户余额不足，无法完成下注');
    }

    const estimatedPayout = this.sumNullableValues(
      normalizedItems.map((item) => item.estimatedPayout),
    );
    const estimatedProfit = this.sumNullableValues(
      normalizedItems.map((item) => item.estimatedProfit),
    );
    const selectionSummary = normalizedItems
      .map((item) => item.displayText)
      .slice(0, 5)
      .join('、');

    const transactionResult = await this.dataSource.transaction(
      async (manager) => {
        const transactionalUserRepository = manager.getRepository(UserEntity);
        const transactionalOrderRepository =
          manager.getRepository(BetOrderEntity);
        const transactionalItemRepository =
          manager.getRepository(BetItemEntity);

        const lockedUser = await transactionalUserRepository.findOne({
          where: { id: userId },
        });

        if (!lockedUser) {
          throw new NotFoundException('用户不存在');
        }

        const lockedBalance = this.roundCurrency(
          Number(lockedUser.rechargeAmount ?? 0) +
            Number(lockedUser.bonusAmount ?? 0),
        );

        if (totalAmount > lockedBalance) {
          throw new BadRequestException('账户余额不足，无法完成下注');
        }

        this.deductUserBalance(lockedUser, totalAmount);
        await transactionalUserRepository.save(lockedUser);

        const order = transactionalOrderRepository.create({
          user: lockedUser,
          game,
          issueNo: input.issueNo?.trim() || null,
          gameLabelSnapshot: game.label,
          betStrategyKey: game.gameModelId,
          status: 'placed',
          totalAmount,
          itemCount: normalizedItems.length,
          estimatedPayout,
          estimatedProfit,
          oddsModeSnapshot: game.oddsMode,
          fixedOddsSnapshot: game.fixedOdds,
          oddsSnapshotText: this.getOddsSummary(game),
          selectionSummary,
          isWinning: null,
          payoutAmount: 0,
          settlementOpenCode: null,
          settledAt: null,
          extraPayload: {
            gameDescription: game.description,
          },
        });

        const saved = await transactionalOrderRepository.save(order);

        const itemEntities = normalizedItems.map((item) =>
          transactionalItemRepository.create({
            order: saved,
            itemIndex: item.itemIndex,
            betType: item.betType,
            displayText: item.displayText,
            amount: item.amount,
            estimatedPayout: item.estimatedPayout,
            estimatedProfit: item.estimatedProfit,
            selectionPayload: item.selection,
            extraPayload: item.extraPayload,
            isWinning: null,
            payoutAmount: 0,
            settledAt: null,
          }),
        );

        await transactionalItemRepository.save(itemEntities);

        return {
          savedOrder: saved,
          updatedUser: lockedUser,
        };
      },
    );

    this.usersService.emitWalletBalanceUpdated(
      transactionResult.updatedUser,
      -totalAmount,
      'bet-created',
    );

    const order = await this.findOrderById(transactionResult.savedOrder.id);

    if (!order) {
      throw new NotFoundException('注单不存在');
    }

    return this.toOrderResponse(order, false);
  }

  async listMemberBets(
    userId: number,
    query: QueryBetsDto,
  ): Promise<ApiPaginatedData<BetOrderResponseDto>> {
    const { items, total, page, pageSize } = await this.listOrders({
      page: query.page,
      pageSize: query.pageSize,
      userId,
      gameId: query.gameId,
      status: query.status,
      keyword: query.keyword,
    });

    return createPaginatedResult(
      items.map((item) => this.toOrderResponse(item, false)),
      total,
      page,
      pageSize,
    );
  }

  async listAdminBets(
    query: QueryBetsDto,
  ): Promise<ApiPaginatedData<BetOrderResponseDto>> {
    const { items, total, page, pageSize } = await this.listOrders({
      page: query.page,
      pageSize: query.pageSize,
      userId: query.userId,
      gameId: query.gameId,
      status: query.status,
      keyword: query.keyword,
    });

    return createPaginatedResult(
      items.map((item) => this.toOrderResponse(item, true)),
      total,
      page,
      pageSize,
    );
  }

  private async listOrders(filters: {
    page: number;
    pageSize: number;
    userId?: number;
    gameId?: number;
    status?: string;
    keyword?: string;
  }) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 10;

    const idQuery = this.betOrderRepository
      .createQueryBuilder('bet')
      .leftJoin('bet.user', 'user')
      .leftJoin('bet.game', 'game')
      .leftJoin('bet.items', 'item')
      .select('bet.id', 'id')
      .addSelect('bet.placedAt', 'placedAt')
      .distinct(true);

    if (typeof filters.userId === 'number') {
      idQuery.andWhere('user.id = :userId', { userId: filters.userId });
    }

    if (typeof filters.gameId === 'number') {
      idQuery.andWhere('game.id = :gameId', { gameId: filters.gameId });
    }

    if (filters.status) {
      idQuery.andWhere('bet.status = :status', { status: filters.status });
    }

    const keyword = filters.keyword?.trim();

    if (keyword) {
      idQuery.andWhere(
        '(bet.issueNo LIKE :keyword OR bet.gameLabelSnapshot LIKE :keyword OR user.username LIKE :keyword OR item.displayText LIKE :keyword)',
        {
          keyword: `%${keyword}%`,
        },
      );
    }

    const total = await idQuery.getCount();
    const idRows = await idQuery
      .orderBy('bet.placedAt', 'DESC')
      .addOrderBy('bet.id', 'DESC')
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .getRawMany<{ id: string }>();
    const ids = idRows.map((row) => Number(row.id)).filter((id) => id > 0);

    if (ids.length === 0) {
      return {
        items: [] as BetOrderEntity[],
        total,
        page,
        pageSize,
      };
    }

    const orders = await this.betOrderRepository
      .createQueryBuilder('bet')
      .leftJoinAndSelect('bet.user', 'user')
      .leftJoinAndSelect('bet.game', 'game')
      .leftJoinAndSelect('bet.items', 'item')
      .where('bet.id IN (:...ids)', { ids })
      .orderBy('bet.placedAt', 'DESC')
      .addOrderBy('bet.id', 'DESC')
      .addOrderBy('item.itemIndex', 'ASC')
      .getMany();

    const orderMap = new Map(orders.map((order) => [order.id, order]));

    return {
      items: ids
        .map((id) => orderMap.get(id))
        .filter(Boolean) as BetOrderEntity[],
      total,
      page,
      pageSize,
    };
  }

  private async findOrderById(id: number) {
    return this.betOrderRepository
      .createQueryBuilder('bet')
      .leftJoinAndSelect('bet.user', 'user')
      .leftJoinAndSelect('bet.game', 'game')
      .leftJoinAndSelect('bet.items', 'item')
      .where('bet.id = :id', { id })
      .orderBy('item.itemIndex', 'ASC')
      .getOne();
  }

  private normalizeBetItem(
    game: Game,
    item: CreateMemberBetItemDto,
    index: number,
  ): NormalizedBetItem {
    const amount = this.roundCurrency(Number(item.amount));
    const exactMatchConfig = this.resolveExactMatchGameConfig(game.gameModelId);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException(`第 ${index + 1} 条下注金额无效`);
    }

    if (game.gameModelId === 'sb') {
      return this.normalizeSbBetItem(game, item, index, amount);
    }

    if (exactMatchConfig) {
      const digitsValue = item.selection?.digits;

      if (
        !Array.isArray(digitsValue) ||
        digitsValue.length !== exactMatchConfig.digits
      ) {
        throw new BadRequestException(exactMatchConfig.invalidLengthMessage);
      }

      const digits = digitsValue.map((digit) => Number(digit));

      if (
        digits.some(
          (digit) =>
            !Number.isInteger(digit) ||
            digit < exactMatchConfig.min ||
            digit > exactMatchConfig.max,
        )
      ) {
        throw new BadRequestException(exactMatchConfig.invalidRangeMessage);
      }

      const normalizedDisplayText = digits.join(' ');
      const estimatedPayout = this.calculateEstimatedPayout(amount, game);
      const estimatedProfit =
        estimatedPayout === null
          ? null
          : this.roundCurrency(estimatedPayout - amount);

      return {
        itemIndex: index + 1,
        betType: item.betType || exactMatchConfig.betType,
        displayText: normalizedDisplayText,
        amount,
        selection: {
          ...item.selection,
          digits,
          source:
            typeof item.selection?.source === 'string'
              ? item.selection.source
              : 'manual',
        },
        extraPayload: item.extraPayload ?? null,
        estimatedPayout,
        estimatedProfit,
      };
    }

    if (game.gameModelId === 'lhd') {
      const side =
        typeof item.selection?.side === 'string'
          ? item.selection.side.trim().toLowerCase()
          : '';

      if (!['dragon', 'tiger', 'tie'].includes(side)) {
        throw new BadRequestException('龙虎斗下注仅支持龙、虎、和三种方向');
      }

      const normalizedDisplayText =
        side === 'dragon' ? '龙' : side === 'tiger' ? '虎' : '和';
      const estimatedPayout = this.calculateEstimatedPayout(amount, game, side);
      const estimatedProfit =
        estimatedPayout === null
          ? null
          : this.roundCurrency(estimatedPayout - amount);

      return {
        itemIndex: index + 1,
        betType: item.betType || 'lhd-pick',
        displayText: item.displayText?.trim() || normalizedDisplayText,
        amount,
        selection: {
          side,
        },
        extraPayload: {
          ...(item.extraPayload ?? {}),
          sideLabel: normalizedDisplayText,
        },
        estimatedPayout,
        estimatedProfit,
      };
    }

    const estimatedPayout = this.calculateEstimatedPayout(amount, game);
    const estimatedProfit =
      estimatedPayout === null
        ? null
        : this.roundCurrency(estimatedPayout - amount);

    return {
      itemIndex: index + 1,
      betType: item.betType || `${game.gameModelId}-generic`,
      displayText: item.displayText.trim(),
      amount,
      selection: item.selection,
      extraPayload: item.extraPayload ?? null,
      estimatedPayout,
      estimatedProfit,
    };
  }

  private normalizeSbBetItem(
    game: Game,
    item: CreateMemberBetItemDto,
    index: number,
    amount: number,
  ): NormalizedBetItem {
    const rawBetType =
      typeof item.betType === 'string' && item.betType.trim().length > 0
        ? item.betType.trim().toLowerCase()
        : 'sb-single-dice';

    if (rawBetType === 'sb-single-dice') {
      const digitsValue = item.selection?.digits;

      if (!Array.isArray(digitsValue) || digitsValue.length !== 3) {
        throw new BadRequestException('筛宝下注必须提供 3 个筛子点数');
      }

      const digits = digitsValue.map((digit) => Number(digit));

      if (
        digits.some(
          (digit) => !Number.isInteger(digit) || digit < 1 || digit > 6,
        )
      ) {
        throw new BadRequestException('筛宝下注号码仅支持 1-6 的三颗筛子点数');
      }

      const displayText = item.displayText?.trim() || digits.join(' ');
      const estimatedPayout = this.calculateEstimatedPayout(amount, game);
      const estimatedProfit =
        estimatedPayout === null
          ? null
          : this.roundCurrency(estimatedPayout - amount);

      return {
        itemIndex: index + 1,
        betType: 'sb-single-dice',
        displayText,
        amount,
        selection: {
          ...item.selection,
          digits,
          source:
            typeof item.selection?.source === 'string'
              ? item.selection.source
              : 'manual',
        },
        extraPayload: item.extraPayload ?? null,
        estimatedPayout,
        estimatedProfit,
      };
    }

    if (rawBetType === 'sb-sum') {
      const sum = Number(item.selection?.sum);

      if (!Number.isInteger(sum) || sum < 4 || sum > 17) {
        throw new BadRequestException('筛宝和值下注仅支持 4-17');
      }

      const estimatedPayout = this.calculateEstimatedPayout(amount, game);
      const estimatedProfit =
        estimatedPayout === null
          ? null
          : this.roundCurrency(estimatedPayout - amount);

      return {
        itemIndex: index + 1,
        betType: 'sb-sum',
        displayText: item.displayText?.trim() || `和值 ${sum}`,
        amount,
        selection: {
          sum,
        },
        extraPayload: item.extraPayload ?? null,
        estimatedPayout,
        estimatedProfit,
      };
    }

    if (rawBetType === 'sb-big-small') {
      const size =
        typeof item.selection?.size === 'string'
          ? item.selection.size.trim().toLowerCase()
          : '';

      if (!SB_SIZE_OPTIONS.has(size)) {
        throw new BadRequestException('筛宝大小下注仅支持 big 或 small');
      }

      const estimatedPayout = this.calculateEstimatedPayout(amount, game);
      const estimatedProfit =
        estimatedPayout === null
          ? null
          : this.roundCurrency(estimatedPayout - amount);

      return {
        itemIndex: index + 1,
        betType: 'sb-big-small',
        displayText: item.displayText?.trim() || (size === 'big' ? '大' : '小'),
        amount,
        selection: {
          size,
        },
        extraPayload: item.extraPayload ?? null,
        estimatedPayout,
        estimatedProfit,
      };
    }

    if (rawBetType === 'sb-odd-even') {
      const parity =
        typeof item.selection?.parity === 'string'
          ? item.selection.parity.trim().toLowerCase()
          : '';

      if (!SB_PARITY_OPTIONS.has(parity)) {
        throw new BadRequestException('筛宝单双下注仅支持 odd 或 even');
      }

      const estimatedPayout = this.calculateEstimatedPayout(amount, game);
      const estimatedProfit =
        estimatedPayout === null
          ? null
          : this.roundCurrency(estimatedPayout - amount);

      return {
        itemIndex: index + 1,
        betType: 'sb-odd-even',
        displayText:
          item.displayText?.trim() || (parity === 'odd' ? '单' : '双'),
        amount,
        selection: {
          parity,
        },
        extraPayload: item.extraPayload ?? null,
        estimatedPayout,
        estimatedProfit,
      };
    }

    if (rawBetType === 'sb-triple-any') {
      const estimatedPayout = this.calculateEstimatedPayout(amount, game);
      const estimatedProfit =
        estimatedPayout === null
          ? null
          : this.roundCurrency(estimatedPayout - amount);

      return {
        itemIndex: index + 1,
        betType: 'sb-triple-any',
        displayText: item.displayText?.trim() || '任意豹子',
        amount,
        selection: {
          triple: 'any',
        },
        extraPayload: item.extraPayload ?? null,
        estimatedPayout,
        estimatedProfit,
      };
    }

    throw new BadRequestException(
      '筛宝下注类型仅支持 sb-single-dice、sb-sum、sb-big-small、sb-odd-even、sb-triple-any',
    );
  }

  private deductUserBalance(user: UserEntity, amount: number) {
    let remaining = this.roundCurrency(amount);
    const currentBonus = this.roundCurrency(Number(user.bonusAmount ?? 0));
    const currentRecharge = this.roundCurrency(
      Number(user.rechargeAmount ?? 0),
    );

    const bonusDeduction = Math.min(currentBonus, remaining);
    remaining = this.roundCurrency(remaining - bonusDeduction);

    const rechargeDeduction = Math.min(currentRecharge, remaining);
    remaining = this.roundCurrency(remaining - rechargeDeduction);

    if (remaining > 0) {
      throw new BadRequestException('账户余额不足，无法完成下注');
    }

    user.bonusAmount = this.roundCurrency(currentBonus - bonusDeduction);
    user.rechargeAmount = this.roundCurrency(
      currentRecharge - rechargeDeduction,
    );
  }

  private calculateEstimatedPayout(
    amount: number,
    game: Game,
    customSide?: string,
  ) {
    if (game.oddsMode !== GameOddsMode.FIXED || game.fixedOdds === null) {
      if (game.gameModelId === 'lhd' && customSide) {
        const odds = this.resolveDragonTigerOdds(game, customSide);

        return this.roundCurrency(amount * odds);
      }

      return null;
    }

    return this.roundCurrency(amount * Number(game.fixedOdds));
  }

  private getOddsSummary(game: Game) {
    if (game.gameModelId === 'lhd') {
      const dragonOdds = this.resolveDragonTigerOdds(game, 'dragon');
      const tigerOdds = this.resolveDragonTigerOdds(game, 'tiger');
      const tieOdds = this.resolveDragonTigerOdds(game, 'tie');

      return `龙 ${dragonOdds.toFixed(2)} · 虎 ${tigerOdds.toFixed(2)} · 和 ${tieOdds.toFixed(2)}`;
    }

    if (game.oddsMode === GameOddsMode.CUSTOM) {
      return '自定义赔付（预留）';
    }

    if (game.fixedOdds === null) {
      return '固定赔率未设置';
    }

    return `固定赔率 ${Number(game.fixedOdds).toFixed(2)}`;
  }

  private sumNullableValues(values: Array<number | null>) {
    if (values.some((value) => value === null)) {
      return null;
    }

    const normalizedValues = values.filter(
      (value): value is number => value !== null,
    );

    return this.roundCurrency(
      normalizedValues.reduce((sum, value) => sum + value, 0),
    );
  }

  private resolveDragonTigerOdds(game: Game, side: string) {
    const config = game.customPayoutConfig;

    if (
      config &&
      typeof config === 'object' &&
      !Array.isArray(config) &&
      typeof config[side] === 'number'
    ) {
      return Number(config[side]);
    }

    if (side === 'tie') {
      return 8.8;
    }

    return 1.98;
  }

  private resolveExactMatchGameConfig(gameModelId: string) {
    if (gameModelId in EXACT_MATCH_GAME_CONFIGS) {
      return EXACT_MATCH_GAME_CONFIGS[
        gameModelId as keyof typeof EXACT_MATCH_GAME_CONFIGS
      ];
    }

    return null;
  }

  private toOrderResponse(
    order: BetOrderEntity,
    includeUser: boolean,
  ): BetOrderResponseDto {
    return {
      id: order.id,
      gameId: order.gameId,
      gameLabel: order.gameLabelSnapshot,
      betStrategyKey: order.betStrategyKey,
      issueNo: order.issueNo,
      status: order.status,
      totalAmount: Number(order.totalAmount ?? 0),
      itemCount: order.itemCount,
      estimatedPayout:
        order.estimatedPayout === null ? null : Number(order.estimatedPayout),
      estimatedProfit:
        order.estimatedProfit === null ? null : Number(order.estimatedProfit),
      oddsSummary: order.oddsSnapshotText,
      selectionSummary: order.selectionSummary,
      isWinning: order.isWinning,
      payoutAmount: Number(order.payoutAmount ?? 0),
      settlementOpenCode: order.settlementOpenCode,
      settledAt: order.settledAt ? this.toIsoString(order.settledAt) : null,
      placedAt: this.toIsoString(order.placedAt),
      items: (order.items ?? [])
        .slice()
        .sort((left, right) => left.itemIndex - right.itemIndex)
        .map((item) => ({
          id: item.id,
          itemIndex: item.itemIndex,
          betType: item.betType,
          displayText: item.displayText,
          amount: Number(item.amount ?? 0),
          estimatedPayout:
            item.estimatedPayout === null ? null : Number(item.estimatedPayout),
          estimatedProfit:
            item.estimatedProfit === null ? null : Number(item.estimatedProfit),
          selection: item.selectionPayload,
          extraPayload: item.extraPayload,
          isWinning: item.isWinning,
          payoutAmount: Number(item.payoutAmount ?? 0),
          settledAt: item.settledAt ? this.toIsoString(item.settledAt) : null,
          createdAt: this.toIsoString(item.createdAt),
        })),
      ...(includeUser && order.user
        ? {
            user: {
              id: order.user.id,
              username: order.user.username,
            },
          }
        : {}),
    };
  }

  private roundCurrency(value: number) {
    return Number(value.toFixed(2));
  }

  private toIsoString(value: Date | string) {
    return value instanceof Date
      ? value.toISOString()
      : new Date(value).toISOString();
  }
}
