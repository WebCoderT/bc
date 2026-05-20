import { CardShell } from "@/app/components/admin/ui/card-shell";
import { ProgressRow } from "@/app/components/admin/ui/progress-row";
import { formatCurrency, formatDate, toneMap } from "@/app/utils/admin-format";
import type {
  DashboardKpiTone,
  DashboardMetrics,
  DashboardSnapshot,
} from "./dashboard.types";
import {
  clampPercent,
  formatCompactCount,
  formatIssueStatus,
  formatPercent,
  getAlertToneClassName,
  getIssueStatusClassName,
} from "./dashboard.utils";

export function DashboardEmptyState({
  isLoading,
  loadError,
}: {
  isLoading: boolean;
  loadError: string;
}) {
  return (
    <div className="space-y-6">
      <CardShell title="运营总览" description="正在汇总后台现有数据指标。">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          {isLoading
            ? "正在读取仪表盘数据..."
            : loadError || "暂无可展示数据。"}
        </div>
      </CardShell>
    </div>
  );
}

export function DashboardContent({
  snapshot,
  metrics,
  loadError,
  onRefresh,
}: {
  snapshot: DashboardSnapshot;
  metrics: DashboardMetrics;
  loadError: string;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">运营总览</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            基于当前用户、下注、游戏、导航、品牌与开奖数据生成的后台实时概览。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            最近刷新：{formatDate(snapshot.fetchedAt)}
          </span>
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800"
          >
            刷新数据
          </button>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="注册用户"
          value={formatCompactCount(metrics.userTotal)}
          delta={`近 7 日 +${formatCompactCount(metrics.newUsers7d)}`}
          hint={`在线 ${formatCompactCount(metrics.onlineUsers)} · VIP ${formatCompactCount(metrics.vipUsers)}`}
          tone="violet"
        />
        <KpiCard
          label="平台余额"
          value={formatCurrency(metrics.walletBalance)}
          delta={`人均 ${formatCurrency(metrics.averageBalance)}`}
          hint={`管理员 ${formatCompactCount(metrics.adminUsers)} · 普通用户 ${formatCompactCount(
            Math.max(
              metrics.userTotal - metrics.vipUsers - metrics.adminUsers,
              0,
            ),
          )}`}
          tone="emerald"
        />
        <KpiCard
          label="注单流水"
          value={formatCurrency(metrics.turnover)}
          delta={`近 7 日 ${formatCurrency(metrics.recent7dTurnover)}`}
          hint={`已派奖 ${formatCurrency(metrics.payoutAmount)} · 待结算 ${formatCompactCount(metrics.pendingBets)}`}
          tone="sky"
        />
        <KpiCard
          label="运营游戏"
          value={formatCompactCount(metrics.onlineGameCount)}
          delta={`总数 ${formatCompactCount(metrics.gameTotal)}`}
          hint={`平均 ${Math.round(metrics.averageDrawInterval || 0)} 秒/期 · 模型启用 ${formatCompactCount(metrics.activeModels)}`}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CardShell
          title="投注概览"
          description="聚合当前所有注单数据，观察流水、中奖与结算表现。"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">注单总量</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatCompactCount(metrics.betTotal)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                待结算 {formatCompactCount(metrics.pendingBets)} · 已取消{" "}
                {formatCompactCount(metrics.cancelledBets)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">单笔均额</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatCurrency(metrics.averageOrderAmount)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                已中奖 {formatCompactCount(metrics.winningBets)} 笔 · 派彩率{" "}
                {formatPercent(metrics.payoutRate)}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <ProgressRow
              label="注单结算率"
              value={`${formatCompactCount(metrics.settledBetCount)}/${formatCompactCount(metrics.betTotal)}`}
              percent={clampPercent(
                metrics.betTotal > 0
                  ? (metrics.settledBetCount / metrics.betTotal) * 100
                  : 0,
              )}
            />
            <ProgressRow
              label="中奖率"
              value={formatPercent(metrics.betWinRate)}
              percent={clampPercent(metrics.betWinRate * 100)}
            />
            <ProgressRow
              label="派彩率"
              value={formatPercent(metrics.payoutRate)}
              percent={clampPercent(metrics.payoutRate * 100)}
            />
            <ProgressRow
              label="近 7 日流水占比"
              value={formatPercent(
                metrics.turnover > 0
                  ? metrics.recent7dTurnover / metrics.turnover
                  : 0,
              )}
              percent={clampPercent(
                metrics.turnover > 0
                  ? (metrics.recent7dTurnover / metrics.turnover) * 100
                  : 0,
              )}
            />
          </div>
        </CardShell>

        <CardShell
          title="系统与配置健康度"
          description="根据现有配置和运行状态计算关键完成度指标。"
        >
          <div className="space-y-5">
            <ProgressRow
              label="用户在线率"
              value={formatPercent(
                metrics.userTotal > 0
                  ? metrics.onlineUsers / metrics.userTotal
                  : 0,
              )}
              percent={clampPercent(
                metrics.userTotal > 0
                  ? (metrics.onlineUsers / metrics.userTotal) * 100
                  : 0,
              )}
            />
            <ProgressRow
              label="游戏在线率"
              value={formatPercent(
                metrics.gameTotal > 0
                  ? metrics.onlineGameCount / metrics.gameTotal
                  : 0,
              )}
              percent={clampPercent(
                metrics.gameTotal > 0
                  ? (metrics.onlineGameCount / metrics.gameTotal) * 100
                  : 0,
              )}
            />
            <ProgressRow
              label="模型启用率"
              value={formatPercent(
                snapshot.models.length > 0
                  ? metrics.activeModels / snapshot.models.length
                  : 0,
              )}
              percent={clampPercent(
                snapshot.models.length > 0
                  ? (metrics.activeModels / snapshot.models.length) * 100
                  : 0,
              )}
            />
            <ProgressRow
              label="导航展示率"
              value={formatPercent(
                metrics.navigationTotal > 0
                  ? metrics.visibleNavigationCount / metrics.navigationTotal
                  : 0,
              )}
              percent={clampPercent(
                metrics.navigationTotal > 0
                  ? (metrics.visibleNavigationCount / metrics.navigationTotal) *
                      100
                  : 0,
              )}
            />
            <ProgressRow
              label="开奖运行正常率"
              value={formatPercent(
                snapshot.currentIssues.length > 0
                  ? metrics.healthyIssueCount / snapshot.currentIssues.length
                  : 0,
              )}
              percent={clampPercent(
                snapshot.currentIssues.length > 0
                  ? (metrics.healthyIssueCount /
                      snapshot.currentIssues.length) *
                      100
                  : 0,
              )}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              服务名称：
              <span className="font-medium text-slate-900">
                {snapshot.serviceStatus.name}
              </span>
            </p>
            <p className="mt-2">
              接口状态：
              <span className="font-medium text-slate-900">
                {snapshot.serviceStatus.status}
              </span>
            </p>
            <p className="mt-2">
              鉴权方式：
              <span className="font-medium text-slate-900">
                {snapshot.serviceStatus.auth}
              </span>
            </p>
          </div>
        </CardShell>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <CardShell
          title="热门游戏投注"
          description="按累计下注金额排序，快速识别当前最活跃的游戏。"
        >
          <div className="space-y-4">
            {metrics.topGameMetrics.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                当前暂无可统计的游戏下注数据。
              </div>
            ) : (
              metrics.topGameMetrics.map((item, index) => (
                <div
                  key={item.gameId}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">TOP {index + 1}</p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">
                        {item.label}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        模型 {item.gameModelId} · {item.drawInterval} 秒/期 ·
                        状态 {item.status}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-slate-500">累计流水</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {formatCurrency(item.amount)}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {formatCompactCount(item.orderCount)} 笔注单
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardShell>

        <CardShell
          title="开奖运行看板"
          description="展示部分在线游戏的当前期号与下一次开奖时间。"
        >
          <div className="space-y-4">
            {snapshot.currentIssues.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                暂未读取到在线游戏的期号信息。
              </div>
            ) : (
              snapshot.currentIssues.map((item) => (
                <div
                  key={item.gameId}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {item.label}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        模型 {item.modelId} · {item.drawInterval} 秒/期
                      </p>
                    </div>

                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getIssueStatusClassName(
                        item.status,
                      )}`}
                    >
                      {formatIssueStatus(item.status)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-white bg-white px-3 py-3 text-sm text-slate-500">
                      当前期号：
                      <span className="ml-1 font-medium text-slate-900">
                        {item.issueNo}
                      </span>
                    </div>
                    <div className="rounded-xl border border-white bg-white px-3 py-3 text-sm text-slate-500">
                      下次开奖：
                      <span className="ml-1 font-medium text-slate-900">
                        {formatDate(item.nextDrawAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardShell>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CardShell
          title="最近动态"
          description="汇总近期账号、注单、游戏更新和公开公告，方便快速巡检。"
        >
          <div className="space-y-4">
            {metrics.timelineItems.map((item) => (
              <div
                key={`${item.type}-${item.title}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                    {item.type}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.meta}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {item.timestamp > 0
                    ? formatDate(new Date(item.timestamp).toISOString())
                    : "无时间戳"}
                </p>
              </div>
            ))}
          </div>
        </CardShell>

        <div className="space-y-6">
          <CardShell
            title="配置概览"
            description="当前后台配置结构和品牌信息摘要。"
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">品牌信息</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {snapshot.appProfile.appName}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {snapshot.appProfile.description || "暂无品牌说明"}
                </p>
                <p className="mt-3 text-xs text-slate-400">
                  Logo 简写：{snapshot.appProfile.logoText || "--"} · 官网标识：
                  {snapshot.appProfile.officialSiteLabel || "--"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <MiniStat
                  title="一级导航"
                  value={String(metrics.rootNavigationCount)}
                />
                <MiniStat
                  title="二级导航"
                  value={String(metrics.secondLevelNavigationCount)}
                />
                <MiniStat
                  title="展示中入口"
                  value={String(metrics.visibleNavigationCount)}
                />
                <MiniStat
                  title="快捷入口"
                  value={String(metrics.shortcutNavigationCount)}
                />
              </div>
            </div>
          </CardShell>

          <CardShell
            title="运营提醒"
            description="基于当前数据自动生成，便于管理员优先排查。"
          >
            <div className="space-y-3">
              {metrics.alerts.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-2xl border px-4 py-4 ${getAlertToneClassName(item.tone)}`}
                >
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 opacity-90">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </CardShell>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  hint,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  hint: string;
  tone: DashboardKpiTone;
}) {
  return (
    <section
      className={`overflow-hidden rounded-3xl bg-linear-to-br ${toneMap[tone]} ring-1`}
    >
      <div className="rounded-3xl border border-white/10 bg-slate-950 px-5 py-5">
        <p className="text-sm text-slate-400">{label}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <h3 className="text-3xl font-semibold text-white">{value}</h3>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
            {delta}
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-400">{hint}</p>
      </div>
    </section>
  );
}

function MiniStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
