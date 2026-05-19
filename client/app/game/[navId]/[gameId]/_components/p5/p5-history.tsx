import { NumberBall } from "@/app/shared/components/lottery/number-ball";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";
import type { P5DrawRecord } from "./p5.types";

type P5HistoryProps = {
  records: P5DrawRecord[];
  variant?: "default" | "sidebar";
  isLoading?: boolean;
  error?: string;
};

export function P5History({
  records,
  variant = "default",
  isLoading = false,
  error = "",
}: P5HistoryProps) {
  const isSidebar = variant === "sidebar";

  return (
    <SurfaceCard className="h-full" padding="md">
      <div className="flex h-full flex-col gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-[var(--accent)]">
            RECENT RECORDS
          </p>
          <h3 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
            历史记录
          </h3>
        </div>

        <div
          className={
            isSidebar
              ? "compact-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
              : "space-y-4"
          }
        >
          {isLoading ? (
            <div className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">
              正在读取开奖历史...
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="rounded-[1.3rem] border border-rose-300/50 bg-rose-500/10 p-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {!isLoading && !error && records.length === 0 ? (
            <div className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">
              暂无开奖记录
            </div>
          ) : null}

          {records.map((record) => (
            <div
              key={record.id}
              className={
                isSidebar
                  ? "rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-3"
                  : "rounded-[1.6rem] border border-[var(--border)] bg-[var(--panel)] p-4"
              }
            >
              <div
                className={
                  isSidebar
                    ? "space-y-3"
                    : "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
                }
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    第 {record.issue} 期
                  </p>
                  <p className="mt-1 text-xs tracking-[0.2em] text-[var(--muted)]">
                    开奖时间 {record.drawnAt}
                  </p>
                </div>

                <div
                  className={
                    isSidebar
                      ? "flex flex-wrap items-center gap-2"
                      : "flex flex-wrap items-center gap-3"
                  }
                >
                  {record.digits.map((digit, index) => (
                    <NumberBall
                      key={`${record.id}-${index}`}
                      digit={digit}
                      size={isSidebar ? "sm" : "md"}
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
