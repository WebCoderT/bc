"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type GameLayoutSidebarContextValue = {
  leftSidebarContent: ReactNode | null;
  setLeftSidebarContent: (content: ReactNode | null) => void;
};

const GameLayoutSidebarContext =
  createContext<GameLayoutSidebarContextValue | null>(null);

export function GameLayoutSidebarProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [leftSidebarContent, setLeftSidebarContent] =
    useState<ReactNode | null>(null);

  const contextValue = useMemo(
    () => ({ leftSidebarContent, setLeftSidebarContent }),
    [leftSidebarContent],
  );

  return (
    <GameLayoutSidebarContext.Provider value={contextValue}>
      {children}
    </GameLayoutSidebarContext.Provider>
  );
}

export function useGameLayoutSidebar() {
  const context = useContext(GameLayoutSidebarContext);

  if (!context) {
    throw new Error(
      "useGameLayoutSidebar 必须在 GameLayoutSidebarProvider 内使用",
    );
  }

  return context;
}

export function GameLayoutLeftSidebarSlot({ content }: { content: ReactNode }) {
  const { setLeftSidebarContent } = useGameLayoutSidebar();

  useEffect(() => {
    setLeftSidebarContent(content);

    return () => {
      setLeftSidebarContent(null);
    };
  }, [content, setLeftSidebarContent]);

  return null;
}
