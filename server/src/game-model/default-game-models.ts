import { GameModelStatus } from './enums/game-model-status.enum';

export const P5_DEFAULT_DRAW_CONFIG = {
  digits: 5,
  min: 0,
  max: 9,
  allowRepeat: true,
} as const;

export const P3_DEFAULT_DRAW_CONFIG = {
  digits: 3,
  min: 0,
  max: 9,
  allowRepeat: true,
} as const;

export const SB_DEFAULT_DRAW_CONFIG = {
  digits: 3,
  min: 1,
  max: 6,
  allowRepeat: true,
} as const;

export const ROULETTE_DEFAULT_DRAW_CONFIG = {
  digits: 1,
  min: 0,
  max: 36,
  allowRepeat: true,
} as const;

export const SSQ_DEFAULT_DRAW_CONFIG = {
  redCount: 6,
  redMin: 1,
  redMax: 33,
  blueCount: 1,
  blueMin: 1,
  blueMax: 16,
  allowRepeat: false,
} as const;

export const DLT_DEFAULT_DRAW_CONFIG = {
  frontCount: 5,
  frontMin: 1,
  frontMax: 35,
  backCount: 2,
  backMin: 1,
  backMax: 12,
  allowRepeat: false,
} as const;

export const LHD_DEFAULT_DRAW_CONFIG = {
  digits: 2,
  min: 0,
  max: 9,
  allowRepeat: true,
} as const;

export const DEFAULT_DRAW_CONFIGS: Record<string, Record<string, unknown>> = {
  lhd: { ...LHD_DEFAULT_DRAW_CONFIG },
  p3: { ...P3_DEFAULT_DRAW_CONFIG },
  p5: { ...P5_DEFAULT_DRAW_CONFIG },
  sb: { ...SB_DEFAULT_DRAW_CONFIG },
  roulette: { ...ROULETTE_DEFAULT_DRAW_CONFIG },
  ssq: { ...SSQ_DEFAULT_DRAW_CONFIG },
  dlt: { ...DLT_DEFAULT_DRAW_CONFIG },
};

export const DEFAULT_GAME_MODELS = [
  {
    id: 'lhd',
    name: '龙虎斗',
    description: '比较龙位与虎位的开奖数字大小，支持龙、虎、和三种投注方向。',
    version: '1.0.0',
    drawConfigJson: { ...LHD_DEFAULT_DRAW_CONFIG },
    resultSchemaJson: {
      openCode: 'string',
      resultPayload: {
        dragon: 'number',
        tiger: 'number',
        winner: 'dragon|tiger|tie',
        winnerLabel: 'string',
      },
    },
    status: GameModelStatus.ACTIVE,
  },
  {
    id: 'p3',
    name: '排列3',
    description: '3 位 0-9 数字排列模型，支持生成开奖号码、和值和跨度。',
    version: '1.0.0',
    drawConfigJson: { ...P3_DEFAULT_DRAW_CONFIG },
    resultSchemaJson: {
      openCode: 'string',
      resultPayload: {
        sum: 'number',
        span: 'number',
        positions: {
          bai: 'number',
          shi: 'number',
          ge: 'number',
        },
      },
    },
    status: GameModelStatus.ACTIVE,
  },
  {
    id: 'p5',
    name: '排列5',
    description: '5 位 0-9 数字排列模型，支持生成开奖号码、和值和跨度。',
    version: '1.0.0',
    drawConfigJson: { ...P5_DEFAULT_DRAW_CONFIG },
    resultSchemaJson: {
      openCode: 'string',
      resultPayload: {
        sum: 'number',
        span: 'number',
        positions: {
          wan: 'number',
          qian: 'number',
          bai: 'number',
          shi: 'number',
          ge: 'number',
        },
      },
    },
    status: GameModelStatus.ACTIVE,
  },
  {
    id: 'sb',
    name: '筛宝',
    description: '3 颗筛子各开出 1 个 1-6 点数，支持逐位精确投注与点数展示。',
    version: '1.0.0',
    drawConfigJson: { ...SB_DEFAULT_DRAW_CONFIG },
    resultSchemaJson: {
      openCode: 'string',
      resultPayload: {
        sum: 'number',
        triple: 'boolean',
        positions: {
          first: 'number',
          second: 'number',
          third: 'number',
        },
      },
    },
    status: GameModelStatus.ACTIVE,
  },
  {
    id: 'roulette',
    name: '轮盘',
    description: '轮盘每期开出 0-36 中的 1 个号码，支持单号直选投注。',
    version: '1.0.0',
    drawConfigJson: { ...ROULETTE_DEFAULT_DRAW_CONFIG },
    resultSchemaJson: {
      openCode: 'string',
      resultPayload: {
        number: 'number',
        color: 'red|black|green',
        parity: 'odd|even|zero',
      },
    },
    status: GameModelStatus.ACTIVE,
  },
  {
    id: 'ssq',
    name: '双色球',
    description:
      '双色球每期开出 6 个不重复红球（1-33）和 1 个蓝球（1-16），支持单式玩法。',
    version: '1.0.0',
    drawConfigJson: { ...SSQ_DEFAULT_DRAW_CONFIG },
    resultSchemaJson: {
      openCode: 'string',
      resultPayload: {
        redBalls: 'number[]',
        blueBall: 'number',
      },
    },
    status: GameModelStatus.ACTIVE,
  },
  {
    id: 'dlt',
    name: '超级大乐透',
    description:
      '超级大乐透每期开出前区 5 个不重复号码（1-35）和后区 2 个不重复号码（1-12），支持单式玩法。',
    version: '1.0.0',
    drawConfigJson: { ...DLT_DEFAULT_DRAW_CONFIG },
    resultSchemaJson: {
      openCode: 'string',
      resultPayload: {
        frontBalls: 'number[]',
        backBalls: 'number[]',
      },
    },
    status: GameModelStatus.ACTIVE,
  },
] as const;
