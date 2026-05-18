import { ActionButton } from "@/app/shared/components/ui/action-button";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";
import type { MockGameCard } from "./mock-game-data";

type MockGameCardProps = {
  game: MockGameCard;
};

/**
 * 单个假游戏卡片展示组件。
 */
export function MockGameCardView({ game }: MockGameCardProps) {
  return (
    <SurfaceCard
      className="overflow-hidden border-[color-mix(in_srgb,var(--border)_82%,white)] p-0"
      tone="card"
    >
      <div
        className={`relative h-44 bg-gradient-to-br ${game.accent} p-5 text-white`}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
            {game.badge}
          </span>
          <span className="rounded-full border border-white/20 bg-black/15 px-3 py-1 text-xs font-medium">
            热度 {game.hotScore}
          </span>
        </div>

        <div className="absolute inset-x-5 bottom-5">
          <p className="text-xs font-semibold tracking-[0.3em] text-white/70">
            {game.provider}
          </p>
          <h4 className="mt-2 text-2xl font-semibold">{game.title}</h4>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <p className="text-sm leading-7 text-[var(--muted)]">
          {game.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {game.tags.map((tag) => (
            <span
              key={`${game.id}-${tag}`}
              className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs text-[var(--muted)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-[var(--accent)]">
              DEMO DATA
            </p>
            <p className="mt-1 text-sm text-[var(--foreground)]">
              预览卡片排版与分组层级
            </p>
          </div>
          <ActionButton variant="solid">立即进入</ActionButton>
        </div>
      </div>
    </SurfaceCard>
  );
}
