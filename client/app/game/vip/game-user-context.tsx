"use client";

import { createContext, ReactNode, useContext } from "react";
import { type AuthUser } from "../../lib/auth";

/**
 * `/game` 区域专用的用户上下文。
 *
 * 它只服务于已登录后台，避免把用户对象从布局层逐级透传到页面层。
 */
const GameUserContext = createContext<AuthUser | null>(null);

/**
 * 为已登录区域注入标准化用户数据。
 */
export function GameUserProvider({
  user,
  children,
}: {
  user: AuthUser;
  children: ReactNode;
}) {
  return (
    <GameUserContext.Provider value={user}>{children}</GameUserContext.Provider>
  );
}

/**
 * 读取当前登录用户。
 *
 * 若在 Provider 外部使用则直接报错，帮助开发阶段快速定位结构问题。
 */
export function useGameUser() {
  const user = useContext(GameUserContext);

  if (!user) {
    throw new Error("useGameUser must be used within GameUserProvider");
  }

  return user;
}
