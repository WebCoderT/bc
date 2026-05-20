import type { ClientGame } from "@/app/lib/client-api";
import { ActionButton } from "@/app/shared/components/ui/action-button";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";
import Link from "next/link";
import { usePathname } from "next/navigation";

type GameCardProps = {
  game: ClientGame;
  index: number;
};

function resolveAccent(index: number) {
  const accents = [
    "from-fuchsia-500/80 via-purple-500/70 to-indigo-500/80",
    "from-cyan-500/80 via-sky-500/70 to-blue-500/80",
    "from-emerald-500/80 via-teal-500/70 to-cyan-500/80",
    "from-amber-500/80 via-orange-500/70 to-rose-500/80",
  ];

  return accents[index % accents.length];
}

function formatGameStatus(status: ClientGame["status"]) {
  return status === "online" ? "运营中" : String(status);
}

/**
 * 真实游戏卡片展示组件。
 */
export function GameCard({ game, index }: GameCardProps) {
  const pathname = usePathname();
  return (
    <SurfaceCard
      className="overflow-hidden border-[color-mix(in_srgb,var(--border)_82%,white)] p-0"
      tone="card"
    >
      <div
        className={`relative h-44 bg-gradient-to-br ${resolveAccent(index)} p-5 text-white`}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
            {formatGameStatus(game.status)}
          </span>
          <span className="rounded-full border border-white/20 bg-black/15 px-3 py-1 text-xs font-medium">
            {game.drawInterval}s
          </span>
        </div>

        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.3em] text-white/70">
              游戏模型： {game.gameModelId}
            </p>
            <h4 className="mt-2 truncate text-2xl font-semibold">
              {game.label}
            </h4>
          </div>
          {game.iconUrl ? (
            <div
              aria-label={game.label}
              className="h-14 w-14 rounded-2xl border border-white/20 bg-white/10 bg-cover bg-center"
              role="img"
              style={{ backgroundImage: `url(${game.iconUrl})` }}
            />
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <p className="line-clamp-3 min-h-[5.25rem] whitespace-pre-line text-sm leading-7 text-[var(--muted)]">
          {game.description ||
            "当前游戏暂无更多说明，后续可继续补充更完整的介绍内容。"}
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs text-[var(--muted)]">
            分类 #{game.category}
          </span>
          <span className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs text-[var(--muted)]">
            模型 {game.gameModelId}
          </span>
          <span className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs text-[var(--muted)]">
            开奖间隔 {game.drawInterval}s
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <div>
            <p className="text-sm text-[var(--foreground)]">
              当前状态：
              <span className="font-medium">
                {formatGameStatus(game.status)}
              </span>
            </p>
          </div>
          <Link href={`${pathname}/${game.id}`} passHref>
            <ActionButton variant="solid">立即进入</ActionButton>
          </Link>
        </div>
      </div>
    </SurfaceCard>
  );
}
