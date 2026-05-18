"use client";
import { useParams } from "next/navigation";
import { EmptyGamePage } from "../../components/empty-game-page";
import { useGameNavigationStore } from "@/app/shared/repositories/game-navigation-repository";

export default function GamePage() {
  // 获取路由参数
  const params = useParams();
  const { navId, gameId } = params;
  // 获取导航数据
  const { navigationSections } = useGameNavigationStore();
  console.log("GamePage - 路由参数：", { navId, gameId });
  console.log("GamePage - 导航数据：", navigationSections);
  return <EmptyGamePage title={`体育赛事`} />;
}
