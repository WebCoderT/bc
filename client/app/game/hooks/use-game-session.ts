"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearStoredUser, type AuthUser, readStoredUser } from "../../lib/auth";

/**
 * 登录态 hook 的返回值结构。
 *
 * 单独定义返回类型后，布局层和其他消费方都能更清晰地理解
 * 这个 hook 会提供哪些状态和动作。
 */
type UseGameSessionResult = {
  isReady: boolean;
  user: AuthUser | null;
  walletSummary: Array<{ label: string; value: string }>;
  logout: () => void;
};

/**
 * 统一处理 `/game` 区域的登录态读取和退出逻辑。
 *
 * 这样布局文件只负责组织结构，不需要同时关心本地存储读取、
 * 页面跳转、钱包信息组装等多种职责。
 */
export function useGameSession(): UseGameSessionResult {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    /**
     * 使用异步队列是为了让 hydration 期间的客户端逻辑更稳定，
     * 并保持与现有项目实现风格一致。
     */
    const timer = window.setTimeout(() => {
      const storedUser = readStoredUser();

      if (!storedUser) {
        router.replace("/");
        return;
      }

      setUser(storedUser);
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  /**
   * 钱包摘要属于派生数据，使用 useMemo 可以表达“由 user 推导而来”。
   */
  const walletSummary = useMemo(() => {
    if (!user) {
      return [];
    }

    return [
      { label: "账户余额", value: `¥ ${user.balance.toFixed(2)}` },
      { label: "绑定邮箱", value: user.email },
      { label: "当前账号", value: user.account },
    ];
  }, [user]);

  /**
   * 退出逻辑集中在 hook 内，避免多个组件自行操作本地存储。
   */
  const logout = () => {
    clearStoredUser();
    router.replace("/");
  };

  return {
    isReady,
    user,
    walletSummary,
    logout,
  };
}
