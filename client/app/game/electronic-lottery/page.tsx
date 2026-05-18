"use client";
import { EmptyGamePage } from "../components/empty-game-page";
import { useGameNavigationStore } from "../../shared/repositories/game-navigation-repository";

// 电子彩票页面
export default function ElectronicLotteryPage() {
  const { navigationSections } = useGameNavigationStore();
  console.log("电子彩票页面 - 导航数据：", navigationSections);
  return <EmptyGamePage title="电子彩票" />;
}
