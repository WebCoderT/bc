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
  roulette: {
    digits: 1,
    min: 0,
    max: 36,
    betType: 'roulette-single-number',
    invalidLengthMessage: '轮盘下注必须提供 1 个号码',
    invalidRangeMessage: '轮盘下注号码仅支持 0-36',
  },
} as const;

const SB_SIZE_OPTIONS = new Set(['big', 'small']);
const SB_PARITY_OPTIONS = new Set(['odd', 'even']);
const ROULETTE_COLOR_OPTIONS = new Set(['red', 'black']);
const ROULETTE_PARITY_OPTIONS = new Set(['odd', 'even']);
const ROULETTE_RANGE_OPTIONS = new Set(['low', 'high']);

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

    if (game.gameModelId === 'roulette') {
      return this.normalizeRouletteBetItem(game, item, index, amount);
    }

    if (game.gameModelId === 'ssq') {
      return this.normalizeSsqBetItem(game, item, index, amount);
    }

    if (game.gameModelId === 'dlt') {
      return this.normalizeDltBetItem(game, item, index, amount);
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

  private normalizeRouletteBetItem(
    game: Game,
    item: CreateMemberBetItemDto,
    index: number,
    amount: number,
  ): NormalizedBetItem {
    const rawBetType =
      typeof item.betType === 'string' && item.betType.trim().length > 0
        ? item.betType.trim().toLowerCase()
        : 'roulette-single-number';

    if (rawBetType === 'roulette-single-number') {
      const digitsValue = item.selection?.digits;

      if (!Array.isArray(digitsValue) || digitsValue.length !== 1) {
        throw new BadRequestException('轮盘下注必须提供 1 个号码');
      }

      const number = Number(digitsValue[0]);

      if (!Number.isInteger(number) || number < 0 || number > 36) {
        throw new BadRequestException('轮盘下注号码仅支持 0-36');
      }

      const estimatedPayout = this.calculateEstimatedPayout(
        amount,
        game,
        undefined,
        rawBetType,
      );
      const estimatedProfit =
        estimatedPayout === null
          ? null
          : this.roundCurrency(estimatedPayout - amount);

      return {
        itemIndex: index + 1,
        betType: 'roulette-single-number',
        displayText: item.displayText?.trim() || String(number),
        amount,
        selection: {
          digits: [number],
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

    if (rawBetType === 'roulette-color') {
      const color =
        typeof item.selection?.color === 'string'
          ? item.selection.color.trim().toLowerCase()
          : '';

      if (!ROULETTE_COLOR_OPTIONS.has(color)) {
        throw new BadRequestException('轮盘红黑下注仅支持 red 或 black');
      }

      const estimatedPayout = this.calculateEstimatedPayout(
        amount,
        game,
        undefined,
        rawBetType,
      );
      const estimatedProfit =
        estimatedPayout === null
          ? null
          : this.roundCurrency(estimatedPayout - amount);

      return {
        itemIndex: index + 1,
        betType: 'roulette-color',
        displayText:
          item.displayText?.trim() || (color === 'red' ? '红' : '黑'),
        amount,
        selection: {
          color,
        },
        extraPayload: item.extraPayload ?? null,
        estimatedPayout,
        estimatedProfit,
      };
    }

    if (rawBetType === 'roulette-parity') {
      const parity =
        typeof item.selection?.parity === 'string'
          ? item.selection.parity.trim().toLowerCase()
          : '';

      if (!ROULETTE_PARITY_OPTIONS.has(parity)) {
        throw new BadRequestException('轮盘单双下注仅支持 odd 或 even');
      }

      const estimatedPayout = this.calculateEstimatedPayout(
        amount,
        game,
        undefined,
        rawBetType,
      );
      const estimatedProfit =
        estimatedPayout === null
          ? null
          : this.roundCurrency(estimatedPayout - amount);

      return {
        itemIndex: index + 1,
        betType: 'roulette-parity',
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

    if (rawBetType === 'roulette-range') {
      const range =
        typeof item.selection?.range === 'string'
          ? item.selection.range.trim().toLowerCase()
          : '';

      if (!ROULETTE_RANGE_OPTIONS.has(range)) {
        throw new BadRequestException('轮盘大小下注仅支持 low 或 high');
      }

      const estimatedPayout = this.calculateEstimatedPayout(
        amount,
        game,
        undefined,
        rawBetType,
      );
      const estimatedProfit =
        estimatedPayout === null
          ? null
          : this.roundCurrency(estimatedPayout - amount);

      return {
        itemIndex: index + 1,
        betType: 'roulette-range',
        displayText:
          item.displayText?.trim() ||
          (range === 'low' ? '小 (1-18)' : '大 (19-36)'),
        amount,
        selection: {
          range,
        },
        extraPayload: item.extraPayload ?? null,
        estimatedPayout,
        estimatedProfit,
      };
    }

    if (rawBetType === 'roulette-dozen') {
      const dozen = Number(item.selection?.dozen);

      if (!Number.isInteger(dozen) || dozen < 1 || dozen > 3) {
        throw new BadRequestException('轮盘打组下注仅支持 1-3 组');
      }

      const estimatedPayout = this.calculateEstimatedPayout(
        amount,
        game,
        undefined,
        rawBetType,
      );
      const estimatedProfit =
        estimatedPayout === null
          ? null
          : this.roundCurrency(estimatedPayout - amount);

      return {
        itemIndex: index + 1,
        betType: 'roulette-dozen',
        displayText: item.displayText?.trim() || `第 ${dozen} 组`,
        amount,
        selection: {
          dozen,
        },
        extraPayload: item.extraPayload ?? null,
        estimatedPayout,
        estimatedProfit,
      };
    }

    if (rawBetType === 'roulette-column') {
      const column = Number(item.selection?.column);

      if (!Number.isInteger(column) || column < 1 || column > 3) {
        throw new BadRequestException('轮盘列组下注仅支持 1-3 列');
      }

      const estimatedPayout = this.calculateEstimatedPayout(
        amount,
        game,
        undefined,
        rawBetType,
      );
      const estimatedProfit =
        estimatedPayout === null
          ? null
          : this.roundCurrency(estimatedPayout - amount);

      return {
        itemIndex: index + 1,
        betType: 'roulette-column',
        displayText: item.displayText?.trim() || `第 ${column} 列`,
        amount,
        selection: {
          column,
        },
        extraPayload: item.extraPayload ?? null,
        estimatedPayout,
        estimatedProfit,
      };
    }

    throw new BadRequestException(
      '轮盘下注类型仅支持 roulette-single-number、roulette-color、roulette-parity、roulette-range、roulette-dozen、roulette-column',
    );
  }

  private normalizeSsqBetItem(
    game: Game,
    item: CreateMemberBetItemDto,
    index: number,
    amount: number,
  ): NormalizedBetItem {
    const rawBetType =
      typeof item.betType === 'string' && item.betType.trim().length > 0
        ? item.betType.trim().toLowerCase()
        : 'ssq-single';

    if (rawBetType !== 'ssq-single') {
      throw new BadRequestException('双色球下注类型仅支持 ssq-single');
    }

    const redBallsRaw = item.selection?.redBalls;
    const blueBallRaw = item.selection?.blueBall;

    if (!Array.isArray(redBallsRaw) || redBallsRaw.length !== 6) {
      throw new BadRequestException('双色球下注必须提供 6 个红球');
    }

    const redBalls = redBallsRaw
      .map((value) => Number(value))
      .sort((left, right) => left - right);

    if (
      redBalls.some(
        (value) => !Number.isInteger(value) || value < 1 || value > 33,
      )
    ) {
      throw new BadRequestException('双色球红球仅支持 1-33');
    }

    if (new Set(redBalls).size !== 6) {
      throw new BadRequestException('双色球红球不能重复');
    }

    const blueBall = Number(blueBallRaw);

    if (!Number.isInteger(blueBall) || blueBall < 1 || blueBall > 16) {
      throw new BadRequestException('双色球蓝球仅支持 1-16');
    }

    const estimatedPayout = this.calculateEstimatedPayout(amount, game);
    const estimatedProfit =
      estimatedPayout === null
        ? null
        : this.roundCurrency(estimatedPayout - amount);

    const normalizedDisplayText =
      item.displayText?.trim() ||
      `红 ${redBalls.join(' ')} | 蓝 ${String(blueBall).padStart(2, '0')}`;

    return {
      itemIndex: index + 1,
      betType: 'ssq-single',
      displayText: normalizedDisplayText,
      amount,
      selection: {
        redBalls,
        blueBall,
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

  private normalizeDltBetItem(
    game: Game,
    item: CreateMemberBetItemDto,
    index: number,
    amount: number,
  ): NormalizedBetItem {
    const rawBetType =
      typeof item.betType === 'string' && item.betType.trim().length > 0
        ? item.betType.trim().toLowerCase()
        : 'dlt-single';

    if (
      rawBetType !== 'dlt-single' &&
      rawBetType !== 'dlt-single-additional' &&
      rawBetType !== 'dlt-multiple' &&
      rawBetType !== 'dlt-multiple-additional' &&
      rawBetType !== 'dlt-dantuo' &&
      rawBetType !== 'dlt-dantuo-additional'
    ) {
      throw new BadRequestException(
        '超级大乐透下注类型仅支持 dlt-single、dlt-single-additional、dlt-multiple、dlt-multiple-additional、dlt-dantuo、dlt-dantuo-additional',
      );
    }

    const isMultiple =
      rawBetType === 'dlt-multiple' || rawBetType === 'dlt-multiple-additional';
    const isDantuo =
      rawBetType === 'dlt-dantuo' || rawBetType === 'dlt-dantuo-additional';
    const isAdditional =
      rawBetType === 'dlt-single-additional' ||
      rawBetType === 'dlt-multiple-additional' ||
      rawBetType === 'dlt-dantuo-additional';

    if (isDantuo) {
      const frontDanRaw = item.selection?.frontDan;
      const frontTuoRaw = item.selection?.frontTuo;
      const backDanRaw = item.selection?.backDan;
      const backTuoRaw = item.selection?.backTuo;

      if (
        !Array.isArray(frontDanRaw) ||
        !Array.isArray(frontTuoRaw) ||
        !Array.isArray(backDanRaw) ||
        !Array.isArray(backTuoRaw)
      ) {
        throw new BadRequestException(
          '超级大乐透胆拖必须提供 frontDan/frontTuo/backDan/backTuo',
        );
      }

      const frontDan = frontDanRaw
        .map((value) => Number(value))
        .sort((left, right) => left - right);
      const frontTuo = frontTuoRaw
        .map((value) => Number(value))
        .sort((left, right) => left - right);
      const backDan = backDanRaw
        .map((value) => Number(value))
        .sort((left, right) => left - right);
      const backTuo = backTuoRaw
        .map((value) => Number(value))
        .sort((left, right) => left - right);

      if (frontDan.length < 1 || frontDan.length > 4) {
        throw new BadRequestException('超级大乐透胆拖前区胆码数量仅支持 1-4');
      }

      if (frontTuo.length < 1) {
        throw new BadRequestException('超级大乐透胆拖前区至少提供 1 个拖码');
      }

      if (backDan.length > 1) {
        throw new BadRequestException('超级大乐透胆拖后区胆码数量仅支持 0-1');
      }

      if (backTuo.length < 1) {
        throw new BadRequestException('超级大乐透胆拖后区至少提供 1 个拖码');
      }

      if (
        frontDan.some(
          (value) => !Number.isInteger(value) || value < 1 || value > 35,
        ) ||
        frontTuo.some(
          (value) => !Number.isInteger(value) || value < 1 || value > 35,
        )
      ) {
        throw new BadRequestException('超级大乐透前区号码仅支持 1-35');
      }

      if (
        backDan.some(
          (value) => !Number.isInteger(value) || value < 1 || value > 12,
        ) ||
        backTuo.some(
          (value) => !Number.isInteger(value) || value < 1 || value > 12,
        )
      ) {
        throw new BadRequestException('超级大乐透后区号码仅支持 1-12');
      }

      if (new Set(frontDan).size !== frontDan.length) {
        throw new BadRequestException('超级大乐透前区胆码不能重复');
      }

      if (new Set(frontTuo).size !== frontTuo.length) {
        throw new BadRequestException('超级大乐透前区拖码不能重复');
      }

      if (frontDan.some((value) => frontTuo.includes(value))) {
        throw new BadRequestException('超级大乐透前区胆码与拖码不能重复');
      }

      if (new Set(backDan).size !== backDan.length) {
        throw new BadRequestException('超级大乐透后区胆码不能重复');
      }

      if (new Set(backTuo).size !== backTuo.length) {
        throw new BadRequestException('超级大乐透后区拖码不能重复');
      }

      if (backDan.some((value) => backTuo.includes(value))) {
        throw new BadRequestException('超级大乐透后区胆码与拖码不能重复');
      }

      const needFrontFromTuo = 5 - frontDan.length;
      const needBackFromTuo = 2 - backDan.length;

      if (frontTuo.length < needFrontFromTuo) {
        throw new BadRequestException(
          '超级大乐透前区拖码数量不足以组成 5 个号码',
        );
      }

      if (backTuo.length < needBackFromTuo) {
        throw new BadRequestException(
          '超级大乐透后区拖码数量不足以组成 2 个号码',
        );
      }

      const frontBalls = [...frontDan, ...frontTuo].sort(
        (left, right) => left - right,
      );
      const backBalls = [...backDan, ...backTuo].sort(
        (left, right) => left - right,
      );
      const combinationCount =
        this.combination(frontTuo.length, needFrontFromTuo) *
        this.combination(backTuo.length, needBackFromTuo);
      const totalAmount = this.roundCurrency(amount * combinationCount);

      const estimatedPayoutBase = this.calculateEstimatedPayout(amount, game);
      const estimatedPayout =
        estimatedPayoutBase === null
          ? null
          : isAdditional
            ? this.roundCurrency(estimatedPayoutBase * 1.6)
            : estimatedPayoutBase;
      const estimatedProfit =
        estimatedPayout === null
          ? null
          : this.roundCurrency(estimatedPayout - totalAmount);

      const normalizedDisplayText =
        item.displayText?.trim() ||
        `前胆 ${frontDan.join(' ')} | 前拖 ${frontTuo.join(' ')} | 后胆 ${
          backDan.map((value) => String(value).padStart(2, '0')).join(' ') ||
          '无'
        } | 后拖 ${backTuo
          .map((value) => String(value).padStart(2, '0'))
          .join(' ')}`;

      return {
        itemIndex: index + 1,
        betType: rawBetType,
        displayText: normalizedDisplayText,
        amount: totalAmount,
        selection: {
          frontDan,
          frontTuo,
          backDan,
          backTuo,
          frontBalls,
          backBalls,
          additional: isAdditional,
          multiple: true,
          dantuo: true,
          unitAmount: amount,
          combinationCount,
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

    const frontBallsRaw = item.selection?.frontBalls;
    const backBallsRaw = item.selection?.backBalls;

    if (!Array.isArray(frontBallsRaw)) {
      throw new BadRequestException('超级大乐透下注必须提供前区号码');
    }

    if (!Array.isArray(backBallsRaw)) {
      throw new BadRequestException('超级大乐透下注必须提供后区号码');
    }

    if (!isMultiple && frontBallsRaw.length !== 5) {
      throw new BadRequestException('超级大乐透单式必须提供前区 5 个号码');
    }

    if (!isMultiple && backBallsRaw.length !== 2) {
      throw new BadRequestException('超级大乐透单式必须提供后区 2 个号码');
    }

    if (isMultiple && frontBallsRaw.length < 5) {
      throw new BadRequestException('超级大乐透复式前区至少提供 5 个号码');
    }

    if (isMultiple && backBallsRaw.length < 2) {
      throw new BadRequestException('超级大乐透复式后区至少提供 2 个号码');
    }

    const frontBalls = frontBallsRaw
      .map((value) => Number(value))
      .sort((left, right) => left - right);
    const backBalls = backBallsRaw
      .map((value) => Number(value))
      .sort((left, right) => left - right);

    if (
      frontBalls.some(
        (value) => !Number.isInteger(value) || value < 1 || value > 35,
      )
    ) {
      throw new BadRequestException('超级大乐透前区号码仅支持 1-35');
    }

    if (new Set(frontBalls).size !== frontBalls.length) {
      throw new BadRequestException('超级大乐透前区号码不能重复');
    }

    if (
      backBalls.some(
        (value) => !Number.isInteger(value) || value < 1 || value > 12,
      )
    ) {
      throw new BadRequestException('超级大乐透后区号码仅支持 1-12');
    }

    if (new Set(backBalls).size !== backBalls.length) {
      throw new BadRequestException('超级大乐透后区号码不能重复');
    }

    const combinationCount = isMultiple
      ? this.combination(frontBalls.length, 5) *
        this.combination(backBalls.length, 2)
      : 1;
    const totalAmount = this.roundCurrency(amount * combinationCount);

    const estimatedPayoutBase = this.calculateEstimatedPayout(amount, game);
    const estimatedPayout =
      estimatedPayoutBase === null
        ? null
        : isAdditional
          ? this.roundCurrency(estimatedPayoutBase * 1.6)
          : estimatedPayoutBase;
    const estimatedProfit =
      estimatedPayout === null
        ? null
        : this.roundCurrency(estimatedPayout - totalAmount);

    const normalizedDisplayText =
      item.displayText?.trim() ||
      `前 ${frontBalls.join(' ')} | 后 ${backBalls
        .map((value) => String(value).padStart(2, '0'))
        .join(' ')}`;

    return {
      itemIndex: index + 1,
      betType: rawBetType,
      displayText: normalizedDisplayText,
      amount: totalAmount,
      selection: {
        frontBalls,
        backBalls,
        additional: isAdditional,
        multiple: isMultiple,
        unitAmount: amount,
        combinationCount,
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
    customBetType?: string,
  ) {
    if (game.oddsMode !== GameOddsMode.FIXED || game.fixedOdds === null) {
      if (game.gameModelId === 'lhd' && customSide) {
        const odds = this.resolveDragonTigerOdds(game, customSide);

        return this.roundCurrency(amount * odds);
      }

      if (game.gameModelId === 'roulette' && customBetType) {
        const odds = this.resolveRouletteOdds(game, customBetType);

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

    if (game.gameModelId === 'ssq') {
      if (game.fixedOdds === null) {
        return '固定赔率未设置';
      }

      return `单式 ${Number(game.fixedOdds).toFixed(2)}`;
    }

    if (game.gameModelId === 'dlt') {
      if (game.fixedOdds === null) {
        return '固定赔率未设置';
      }

      const singleOdds = Number(game.fixedOdds);
      const additionalOdds = this.roundCurrency(singleOdds * 1.6);

      return `单式 ${singleOdds.toFixed(2)} · 追加 ${additionalOdds.toFixed(2)}`;
    }

    if (game.oddsMode === GameOddsMode.CUSTOM) {
      if (game.gameModelId === 'roulette') {
        const single = this.resolveRouletteOdds(game, 'roulette-single-number');
        const color = this.resolveRouletteOdds(game, 'roulette-color');
        const parity = this.resolveRouletteOdds(game, 'roulette-parity');
        const range = this.resolveRouletteOdds(game, 'roulette-range');
        const dozen = this.resolveRouletteOdds(game, 'roulette-dozen');
        const column = this.resolveRouletteOdds(game, 'roulette-column');

        return `单号 ${single.toFixed(2)} · 红黑 ${color.toFixed(2)} · 单双 ${parity.toFixed(2)} · 大小 ${range.toFixed(2)} · 组 ${dozen.toFixed(2)} · 列 ${column.toFixed(2)}`;
      }

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

  private resolveRouletteOdds(game: Game, betType: string) {
    const payoutKeyByBetType: Record<string, string> = {
      'roulette-single-number': 'single',
      'roulette-color': 'color',
      'roulette-parity': 'parity',
      'roulette-range': 'range',
      'roulette-dozen': 'dozen',
      'roulette-column': 'column',
    };
    const fallbackOddsByKey: Record<string, number> = {
      single: 36,
      color: 2,
      parity: 2,
      range: 2,
      dozen: 3,
      column: 3,
    };
    const payoutKey = payoutKeyByBetType[betType] ?? 'single';

    if (
      game.customPayoutConfig &&
      typeof game.customPayoutConfig === 'object' &&
      !Array.isArray(game.customPayoutConfig) &&
      typeof game.customPayoutConfig[payoutKey] === 'number'
    ) {
      return Number(game.customPayoutConfig[payoutKey]);
    }

    return fallbackOddsByKey[payoutKey] ?? 2;
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

  private combination(n: number, k: number) {
    if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0) {
      return 0;
    }

    if (k > n) {
      return 0;
    }

    if (k === 0 || k === n) {
      return 1;
    }

    const safeK = Math.min(k, n - k);
    let result = 1;

    for (let index = 1; index <= safeK; index += 1) {
      result = (result * (n - safeK + index)) / index;
    }

    return Math.round(result);
  }

  private toIsoString(value: Date | string) {
    return value instanceof Date
      ? value.toISOString()
      : new Date(value).toISOString();
  }
}
