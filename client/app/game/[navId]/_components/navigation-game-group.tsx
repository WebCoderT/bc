import type { ClientGame, ClientNavigation } from "@/app/lib/client-api";
import { GameCard } from "./game-card";

type NavigationGameGroupProps = {
  games: ClientGame[];
  groupIndex: number;
  navigation: ClientNavigation;
  totalGameCount: number;
};

/**
 * 子导航分组区块，负责标题信息和对应游戏卡片网格。
 */
export function NavigationGameGroup({
  games,
  groupIndex,
  navigation,
  totalGameCount,
}: NavigationGameGroupProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <a href={navigation.path}></a>
          <h3 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            # {navigation.name}
          </h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            当前分组已接入真实接口，展示的是该子导航下分页返回的游戏列表。
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <span className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2">
            当前 {games.length} / 共 {totalGameCount}
          </span>
        </div>
      </div>

      {games.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {games.map((game, gameIndex) => (
            <GameCard
              key={game.id}
              game={game}
              index={groupIndex + gameIndex}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.6rem] border border-dashed border-[var(--border)] bg-[var(--panel)] px-6 py-10 text-center text-sm text-[var(--muted)]">
          当前子导航下暂无游戏数据。
        </div>
      )}
    </section>
  );
}
