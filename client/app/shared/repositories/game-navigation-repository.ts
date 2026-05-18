"use client";

import { useSyncExternalStore } from "react";
import type { GameNavigationSection } from "@/app/game/navigation";

export type GameNavigationState = {
  navigationSections: GameNavigationSection[];
  updatedAt: number | null;
};

type GameNavigationUpdater = (
  previous: GameNavigationSection[],
) => GameNavigationSection[];

const EMPTY_NAVIGATION_SECTIONS: GameNavigationSection[] = [];

let state: GameNavigationState = {
  navigationSections: EMPTY_NAVIGATION_SECTIONS,
  updatedAt: null,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function createNextState(navigationSections: GameNavigationSection[]) {
  return {
    navigationSections,
    updatedAt: Date.now(),
  } satisfies GameNavigationState;
}

/**
 * 同步读取当前导航仓库快照。
 */
export function getGameNavigationSnapshot() {
  return state;
}

/**
 * 订阅导航仓库变更，供 `useSyncExternalStore` 使用。
 */
export function subscribeGameNavigation(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * 用新的导航分组列表整体替换当前仓库内容。
 */
export function setGameNavigationSections(
  navigationSections: GameNavigationSection[],
) {
  state = createNextState(navigationSections);
  emitChange();
}

/**
 * 基于上一次导航分组结果执行局部更新。
 */
export function updateGameNavigationSections(updater: GameNavigationUpdater) {
  state = createNextState(updater(state.navigationSections));
  emitChange();
}

/**
 * 清空导航仓库内容，常用于退出登录或数据失效场景。
 */
export function clearGameNavigationSections() {
  state = {
    navigationSections: EMPTY_NAVIGATION_SECTIONS,
    updatedAt: null,
  };
  emitChange();
}

/**
 * React Hook：任意组件都可订阅导航仓库的最新状态。
 */
export function useGameNavigationStore() {
  return useSyncExternalStore(
    subscribeGameNavigation,
    getGameNavigationSnapshot,
    getGameNavigationSnapshot,
  );
}
