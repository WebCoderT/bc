"use client";
import { EmptyGamePage } from "../components/empty-game-page";
import { useGameSession } from "../hooks/use-game-session";

// 电子彩票页面
export default function ElectronicLotteryPage() {
    const {  navigationSections, walletSummary } = useGameSession();
  console.log("电子彩票页面 - 导航数据：", navigationSections);
  console.log("电子彩票页面 - 钱包数据：", walletSummary);
  return <EmptyGamePage title="电子彩票" />;
}