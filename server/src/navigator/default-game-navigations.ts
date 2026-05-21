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
    key: 'member-center',
    name: '会员中心',
    path: '/game/vip',
    description: '会员中心入口，统一进入个人资料、钱包总览与 VIP 专属内容。',
    icon: '👤',
    type: NavigationType.Top,
    status: NavigationStatus.Visible,
    sort: 5,
    parentKey: null,
  },
  {
    key: 'number-lottery',
    name: '数字彩',
    path: '/game/number-lottery',
    description: '数字排列类游戏导航，统一承载排列3、排列5等数字型开奖游戏。',
    icon: '◌',
    type: NavigationType.Top,
    status: NavigationStatus.Visible,
    sort: 10,
    parentKey: null,
  },
  {
    key: 'p5-category',
    name: '排列5',
    path: '/game/number-lottery#p5',
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
    path: '/game/number-lottery#p3',
    description: '排列3游戏分组，适配三位数字排列模型。',
    icon: '③',
    type: NavigationType.Side,
    status: NavigationStatus.Visible,
    sort: 12,
    parentKey: 'number-lottery',
  },
  {
    key: 'lhd-category',
    name: '龙虎斗',
    path: '/game/number-lottery#lhd',
    description: '龙虎斗游戏分组，适配龙、虎、和大小对比玩法。',
    icon: '龙',
    type: NavigationType.Side,
    status: NavigationStatus.Visible,
    sort: 13,
    parentKey: 'number-lottery',
  },
];
