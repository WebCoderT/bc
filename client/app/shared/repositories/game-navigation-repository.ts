"use client";

import { useSyncExternalStore } from "react";
import type { ClientNavigation } from "@/app/lib/client-api";

/**
 * 游戏导航仓库状态。
 *
 * 这里直接使用服务端返回的导航结构，不再做前端 key 映射。
 */
export type GameNavigationState = {
  navigations: ClientNavigation[];
  updatedAt: number | null;
};

type GameNavigationUpdater = (
  previous: ClientNavigation[],
) => ClientNavigation[];

const EMPTY_NAVIGATIONS: ClientNavigation[] = [];

let state: GameNavigationState = {
  navigations: EMPTY_NAVIGATIONS,
  updatedAt: null,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function createNextState(navigations: ClientNavigation[]) {
  return {
    navigations,
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
 * 用新的导航树整体替换当前仓库内容。
 */
export function setGameNavigations(navigations: ClientNavigation[]) {
  state = createNextState(navigations);
  emitChange();
}

/**
 * 基于上一次导航树结果执行局部更新。
 */
export function updateGameNavigations(updater: GameNavigationUpdater) {
  state = createNextState(updater(state.navigations));
  emitChange();
}

/**
 * 清空导航仓库内容，常用于退出登录或数据失效场景。
 */
export function clearGameNavigations() {
  state = {
    navigations: EMPTY_NAVIGATIONS,
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
