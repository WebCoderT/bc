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
    label: '排列5',
    description:
      '排列5从 00000 至 99999 中开出 1 个五位号码，顺序固定为万、千、百、十、个位。',
    iconUrl: '',
    categoryPath: 'p5',
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
    categoryPath: 'p3',
    gameModelId: 'p3',
    drawInterval: 60,
    status: GameType.ONLINE,
    oddsMode: GameOddsMode.FIXED,
    fixedOdds: 1.98,
    customPayoutConfig: null,
  },
];
