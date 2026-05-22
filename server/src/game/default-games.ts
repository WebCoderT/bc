import { GameOddsMode } from './enums/game-odds-mode.enum';
import { GameType } from './enums/game-type.enum';

export type DefaultGameSeed = {
  label: string;
  description: string;
  iconUrl: string;
  categoryPath: string;
  gameModelId: string;
  drawInterval: number;
  status: GameType;
  oddsMode: GameOddsMode;
  fixedOdds: number | null;
  customPayoutConfig: Record<string, unknown> | null;
};

export const DEFAULT_GAMES: DefaultGameSeed[] = [
  {
    label: '龙虎斗',
    description:
      '龙虎斗每期开出两位数字，比较龙位与虎位大小，支持下注龙、虎、和。',
    iconUrl: '',
    categoryPath: '/game/number-lottery#lhd',
    gameModelId: 'lhd',
    drawInterval: 60,
    status: GameType.ONLINE,
    oddsMode: GameOddsMode.CUSTOM,
    fixedOdds: null,
    customPayoutConfig: {
      dragon: 1.98,
      tiger: 1.98,
      tie: 8.8,
    },
  },
  {
    label: '排列5',
    description:
      '排列5从 00000 至 99999 中开出 1 个五位号码，顺序固定为万、千、百、十、个位。',
    iconUrl: '',
    categoryPath: '/game/number-lottery#p5',
    gameModelId: 'p5',
    drawInterval: 60,
    status: GameType.ONLINE,
    oddsMode: GameOddsMode.FIXED,
    fixedOdds: 1.98,
    customPayoutConfig: null,
  },
  {
    label: '排列3',
    description:
      '排列3从 000 至 999 中开出 1 个三位号码，顺序固定为百、十、个位。',
    iconUrl: '',
    categoryPath: '/game/number-lottery#p3',
    gameModelId: 'p3',
    drawInterval: 60,
    status: GameType.ONLINE,
    oddsMode: GameOddsMode.FIXED,
    fixedOdds: 1.98,
    customPayoutConfig: null,
  },
  {
    label: '筛宝',
    description:
      '筛宝每期开出三颗筛子的点数，范围为 1 至 6，支持逐位精确选择三个点数。',
    iconUrl: '',
    categoryPath: '/game/number-lottery#sb',
    gameModelId: 'sb',
    drawInterval: 60,
    status: GameType.ONLINE,
    oddsMode: GameOddsMode.FIXED,
    fixedOdds: 1.98,
    customPayoutConfig: null,
  },
];
