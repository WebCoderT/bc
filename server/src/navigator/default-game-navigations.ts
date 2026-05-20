import { NavigationStatus } from './enums/navigation-status.enum';
import { NavigationType } from './enums/navigation-type.enum';

export type DefaultGameNavigationSeed = {
  key: string;
  name: string;
  path: string;
  description: string;
  icon: string;
  type: NavigationType;
  status: NavigationStatus;
  sort: number;
  parentKey: string | null;
};

export const DEFAULT_GAME_NAVIGATIONS: DefaultGameNavigationSeed[] = [
  {
    key: 'number-lottery',
    name: '数字彩',
    path: 'number-lottery',
    description: '数字排列类游戏导航，统一承载排列3、排列5等数字型开奖游戏。',
    icon: '◌',
    type: NavigationType.Side,
    status: NavigationStatus.Visible,
    sort: 10,
    parentKey: null,
  },
  {
    key: 'p5-category',
    name: '排列5',
    path: 'p5',
    description: '排列5游戏分组，适配五位数字排列模型。',
    icon: '⑤',
    type: NavigationType.Side,
    status: NavigationStatus.Visible,
    sort: 11,
    parentKey: 'number-lottery',
  },
  {
    key: 'p3-category',
    name: '排列3',
    path: 'p3',
    description: '排列3游戏分组，适配三位数字排列模型。',
    icon: '③',
    type: NavigationType.Side,
    status: NavigationStatus.Visible,
    sort: 12,
    parentKey: 'number-lottery',
  },
];
