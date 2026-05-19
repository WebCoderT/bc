"use client";

import { useEffect, useState } from "react";
import { useAdminSession } from "@/app/components/admin/admin-session-context";
import { CardShell } from "@/app/components/admin/ui/card-shell";
import { PaginationControls } from "@/app/components/admin/ui/pagination-controls";
import {
  executeAdminRequest,
  fetchAdminBets,
  type AdminBetOrder,
  type AdminBetStatus,
} from "@/app/lib/admin-api";

const STATUS_OPTIONS: Array<{ value: AdminBetStatus | "all"; label: string }> =
  [
    { value: "all", label: "全部状态" },
    { value: "placed", label: "已下注" },
    { value: "settled", label: "已结算" },
    { value: "cancelled", label: "已取消" },
  ];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return value;
  }
}

function getStatusClassName(status: AdminBetStatus) {
  if (status === "settled") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "cancelled") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-sky-200 bg-sky-50 text-sky-700";
}

function getStatusText(status: AdminBetStatus) {
  if (status === "settled") {
    return "已结算";
  }

  if (status === "cancelled") {
    return "已取消";
  }

  return "已下注";
}

export default function AdminBetsPage() {
  const { session, logout } = useAdminSession();
  const [bets, setBets] = useState<AdminBetOrder[]>([]);
  const [keyword, setKeyword] = useState("");
  const [draftKeyword, setDraftKeyword] = useState("");
  const [status, setStatus] = useState<AdminBetStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    void executeAdminRequest({
      request: () =>
        fetchAdminBets(session.accessToken, {
          page,
          pageSize: 10,
          status,
          keyword,
        }),
      fallbackMessage: "读取下注历史失败",
      onStart: () => {
        if (cancelled) {
          return;
        }

        setIsLoading(true);
        setLoadError("");
      },
      onSuccess: (response) => {
        if (cancelled || !response) {
          return;
        }

        setBets(response.items);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      },
      onError: (message) => {
        if (cancelled) {
          return;
        }

        setBets([]);
        setLoadError(message);
      },
      onAuthError: () => {
        if (cancelled) {
          return;
        }

        logout();
      },
      onFinally: () => {
        if (cancelled) {
          return;
        }

        setIsLoading(false);
      },
    });

    return () => {
      cancelled = true;
    };
  }, [keyword, logout, page, session.accessToken, status]);

  return (
    <div className="space-y-6">
      <CardShell
        title="下注管理"
        description="统一查看所有游戏下注订单，兼容按游戏模型扩展不同下注结构。"
      >
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3 md:max-w-3xl md:flex-row">
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
              placeholder="搜索用户名、游戏、期号或选号文案"
              value={draftKeyword}
              onChange={(event) => setDraftKeyword(event.target.value)}
            />
            <select
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value as AdminBetStatus | "all");
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setPage(1);
                setKeyword(draftKeyword.trim());
              }}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              应用筛选
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            共 <span className="font-semibold text-slate-900">{total}</span>{" "}
            条注单
          </div>
        </div>

        {loadError ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {loadError}
          </div>
        ) : null}

        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              正在读取下注数据...
            </div>
          ) : null}

          {!isLoading && !loadError && bets.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              当前筛选条件下暂无下注记录。
            </div>
          ) : null}

          {bets.map((bet) => (
            <section
              key={bet.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      注单 #{bet.id}
                    </h3>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClassName(
                        bet.status,
                      )}`}
                    >
                      {getStatusText(bet.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    用户：{bet.user?.username ?? "未知用户"}
                    {` · 游戏：${bet.gameLabel}`}
                    {bet.issueNo ? ` · 期号：${bet.issueNo}` : ""}
                    {` · ${formatDateTime(bet.placedAt)}`}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {bet.selectionSummary || "暂无摘要"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryMetric
                    title="总金额"
                    value={formatCurrency(bet.totalAmount)}
                  />
                  <SummaryMetric
                    title="预计派彩"
                    value={
                      bet.estimatedPayout === null
                        ? "待规则结算"
                        : formatCurrency(bet.estimatedPayout)
                    }
                  />
                  <SummaryMetric
                    title="预计盈利"
                    value={
                      bet.estimatedProfit === null
                        ? "待规则结算"
                        : formatCurrency(bet.estimatedProfit)
                    }
                  />
                  <SummaryMetric title="赔率快照" value={bet.oddsSummary} />
                </div>
              </div>

              <div className="mt-5 grid gap-3 xl:grid-cols-2">
                {bet.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          第 {item.itemIndex} 注 · {item.displayText}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          玩法：{item.betType}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                        预计派彩：
                        <span className="ml-1 font-medium text-slate-900">
                          {item.estimatedPayout === null
                            ? "待规则结算"
                            : formatCurrency(item.estimatedPayout)}
                        </span>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                        预计盈利：
                        <span className="ml-1 font-medium text-slate-900">
                          {item.estimatedProfit === null
                            ? "待规则结算"
                            : formatCurrency(item.estimatedProfit)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {totalPages > 1 ? (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </CardShell>
    </div>
  );
}

function SummaryMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
