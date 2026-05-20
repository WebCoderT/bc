"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearStoredSession,
  formatAuthCurrency,
  refreshStoredSession,
  readStoredSession,
  type AuthUser,
  writeStoredSession,
} from "../../lib/auth";
import { fetchMemberNavigations } from "../../lib/client-api";
import { createClientRealtimeSocket } from "../../lib/client-realtime";
import {
  FloatingNotificationBubbles,
  useFloatingNotificationBubbles,
} from "../../shared/components/ui/floating-notification-bubbles";
import {
  clearGameNavigations,
  setGameNavigations,
  useGameNavigationStore,
} from "../../shared/repositories/game-navigation-repository";

/**
 * 统一处理 `/game` 区域的登录态读取和退出逻辑。
 *
 * 这样布局文件只负责组织结构，不需要同时关心本地存储读取、
 * 页面跳转、钱包信息组装等多种职责。
 */
export function useGameSession() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { navigations } = useGameNavigationStore();
  const { items: notificationItems, pushBubble } =
    useFloatingNotificationBubbles();

  useEffect(() => {
    /**
     * 使用异步队列是为了让 hydration 期间的客户端逻辑更稳定，
     * 并保持与现有项目实现风格一致。
     */
    const timer = window.setTimeout(() => {
      void (async () => {
        const storedSession = readStoredSession();

        if (!storedSession) {
          clearGameNavigations();
          router.replace("/");
          return;
        }

        try {
          const refreshedSession = await refreshStoredSession(storedSession);
          const navigationResult = await fetchMemberNavigations(
            storedSession.accessToken,
          ).catch(() => null);

          writeStoredSession(refreshedSession);
          setAccessToken(refreshedSession.accessToken);
          setUser(refreshedSession.user);
          setGameNavigations(navigationResult ? navigationResult.items : []);
          setIsReady(true);
        } catch {
          clearStoredSession();
          clearGameNavigations();
          router.replace("/");
        }
      })();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (!accessToken || !user) {
      return;
    }

    const socket = createClientRealtimeSocket(accessToken);

    socket.on(
      "wallet:balance-updated",
      (payload: {
        userId: number;
        rechargeAmount: number;
        bonusAmount: number;
        totalBalance: number;
        changeAmount: number;
        reason: "bet-created" | "bet-settled" | "admin-updated";
      }) => {
        if (payload.userId !== user.id) {
          return;
        }

        const storedSession = readStoredSession();

        if (!storedSession) {
          return;
        }

        const nextUser = {
          ...storedSession.user,
          rechargeAmount: payload.rechargeAmount,
          bonusAmount: payload.bonusAmount,
          totalBalance: payload.totalBalance,
        };

        writeStoredSession({
          ...storedSession,
          user: nextUser,
        });
        setUser(nextUser);

        const changeLabel =
          payload.changeAmount > 0
            ? `+${formatAuthCurrency(payload.changeAmount)}`
            : formatAuthCurrency(payload.changeAmount);

        pushBubble({
          title: "钱包余额更新",
          message: `余额已同步，变动 ${changeLabel}，当前余额 ${formatAuthCurrency(payload.totalBalance)}`,
          tone: payload.changeAmount >= 0 ? "success" : "warning",
          durationMs: 3600,
        });
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [accessToken, pushBubble, user]);

  /**
   * 钱包摘要属于派生数据，使用 useMemo 可以表达“由 user 推导而来”。
   */
  const walletSummary = useMemo(() => {
    if (!user) {
      return [];
    }

    return [
      { label: "账户总余额", value: formatAuthCurrency(user.totalBalance) },
      { label: "充值额度", value: formatAuthCurrency(user.rechargeAmount) },
      { label: "赠送额度", value: formatAuthCurrency(user.bonusAmount) },
    ];
  }, [user]);

  /**
   * 退出逻辑集中在 hook 内，避免多个组件自行操作本地存储。
   */
  const logout = () => {
    setAccessToken(null);
    clearStoredSession();
    clearGameNavigations();
    router.replace("/");
  };

  return {
    isReady,
    navigations,
    user,
    walletSummary,
    logout,
    notificationItems,
  };
}
