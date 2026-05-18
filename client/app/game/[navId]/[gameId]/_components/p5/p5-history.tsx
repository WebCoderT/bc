import { NumberBall } from "@/app/shared/components/lottery/number-ball";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";
import type { P5DrawRecord } from "./p5.types";

type P5HistoryProps = {
  records: P5DrawRecord[];
};

export function P5History({ records }: P5HistoryProps) {
  return (
    <SurfaceCard padding="lg">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-[var(--accent)]">
            RECENT RECORDS
          </p>
          <h3 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
            最近模拟记录
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            每次点击随机按钮后，最新一条记录会插入到顶部，用来模拟开奖记录区块的展示效果。
          </p>
        </div>

        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="rounded-[1.6rem] border border-[var(--border)] bg-[var(--panel)] p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    第 {record.issue} 期
                  </p>
                  <p className="mt-1 text-xs tracking-[0.2em] text-[var(--muted)]">
                    模拟生成时间 {record.drawnAt}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {record.digits.map((digit, index) => (
                    <NumberBall
                      key={`${record.id}-${index}`}
                      digit={digit}
                      size="md"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}
