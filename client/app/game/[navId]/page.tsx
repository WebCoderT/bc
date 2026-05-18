"use client";
import { useParams, usePathname } from "next/navigation";
import { EmptyGamePage } from "../components/empty-game-page";
import { useGameNavigationStore } from "@/app/shared/repositories/game-navigation-repository";
import { getGameSectionByPath } from "../navigation";
import { SectionHeading } from "@/app/shared/components/ui/section-heading";

export default function GamePage() {
  // 获取路由参数
  const params = useParams();
  const { navId, gameId } = params;
  const pathname = usePathname();
  // 获取导航数据
  const { navigationSections } = useGameNavigationStore();
  // 根据路径匹配当前导航分组，拿到对应的二级导航列表
  const navigator =
    getGameSectionByPath(pathname, navigationSections)?.items || [];
  console.log("GamePage - 路由参数：", { navId, gameId });

  return (
    <main className="space-y-5">
      <section className="rounded-[2.2rem] border border-[var(--border)] bg-[linear-gradient(135deg,var(--accent),color-mix(in_srgb,var(--accent)_30%,black))] p-7 text-white shadow-[0_24px_80px_var(--glow)] lg:p-8">
        <SectionHeading
          eyebrow="EMPTY PAGE"
          title="asd"
          description="这是根据顶部导航生成的空页面占位，后续可以在这里继续补充业务内容。"
          inverted
        />
      </section>

      <EmptyGamePage title="asd" />
    </main>
  );
}
