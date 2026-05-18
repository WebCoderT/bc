import { SurfaceCard } from "@/app/shared/components/ui/surface-card";

const RULES = [
  "排列5每期从 00000 到 99999 中开出 1 个五位号码。",
  "每一位号码独立生成，顺序固定为万位、千位、百位、十位、个位。",
  "当前页面为玩法展示版，重点用于搭建页面结构与交互节奏。",
  "后续可继续加入选号方式、玩法说明、赔率或奖金说明等内容。",
];

export function P5Rules() {
  return (
    <SurfaceCard className="h-full" padding="lg">
      <div className="space-y-5">
        <div>
          <h3 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
            排列5玩法说明
          </h3>
        </div>

        <div className="space-y-3">
          {RULES.map((rule) => (
            <div
              key={rule}
              className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm leading-7 text-[var(--muted)]"
            >
              {rule}
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}
