"use client";
import { useParams } from "next/navigation";
import { EmptyGamePage } from "../../components/empty-game-page";

export default function GamePage() {
  // 获取路由参数
  const params = useParams();
  const { navId, gameId } = params;
  return <EmptyGamePage title={`体育赛事 ${navId} - ${gameId}`} />;
}
