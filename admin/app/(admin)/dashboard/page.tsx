"use client";

import { useEffect, useState } from "react";
import { useAdminSession } from "@/app/components/admin/admin-session-context";
import { CardShell } from "@/app/components/admin/ui/card-shell";
import { ProgressRow } from "@/app/components/admin/ui/progress-row";
import { activityItems, statItems } from "@/app/data/admin-data";
import {
  fetchAnnouncements,
  fetchServiceStatus,
  isAdminAuthError,
  type ServiceStatus,
} from "@/app/lib/admin-api";
import { toneMap } from "@/app/utils/admin-format";

export default function DashboardRoute() {
  const { logout } = useAdminSession();
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(
    null,
  );
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      try {
        const [statusResponse, announcementsResponse] = await Promise.all([
          fetchServiceStatus(),
          fetchAnnouncements(),
        ]);

        if (cancelled) {
          return;
        }

        setServiceStatus(statusResponse);
        setAnnouncements(announcementsResponse.items);
        setLoadError("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (isAdminAuthError(error)) {
          logout();
          return;
        }

        setLoadError(
          error instanceof Error ? error.message : "读取后端状态失败",
        );
      }
    }

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [logout]);
  console.log(announcements);
  const displayActivities = announcements?.length
    ? announcements.map((item, index) => ({
        title: item,
        time: "来自公开公告接口",
        type: `公告 ${index + 1}`,
      }))
    : activityItems;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => (
          <section
            key={item.label}
            className={`overflow-hidden rounded-3xl bg-gradient-to-br ${toneMap[item.tone]} ring-1`}
          >
            <div className="rounded-3xl border border-white/10 bg-slate-950 px-5 py-5">
              <p className="text-sm text-slate-400">{item.label}</p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <h3 className="text-3xl font-semibold text-white">
                  {item.value}
                </h3>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                  {item.delta}
                </span>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <CardShell title="今日运营动态">
          <div className="space-y-4">
            {displayActivities.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                    {item.type}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.time}</p>
              </div>
            ))}
          </div>
        </CardShell>

        <CardShell title="系统健康度">
          {loadError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {loadError}
            </div>
          ) : null}

          <div className="space-y-5">
            <ProgressRow label="接口可用性" value="99.98%" percent={99} />
            <ProgressRow label="登录成功率" value="97.2%" percent={97} />
            <ProgressRow label="导航配置完成度" value="92.0%" percent={92} />
            <ProgressRow label="游戏数据完整率" value="95.4%" percent={95} />
          </div>

          {serviceStatus ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p>
                服务名称：
                <span className="font-medium text-slate-900">
                  {serviceStatus.name}
                </span>
              </p>
              <p className="mt-2">
                鉴权方式：
                <span className="font-medium text-slate-900">
                  {serviceStatus.auth}
                </span>
              </p>
              <p className="mt-2">
                管理文档：
                <span className="font-medium text-slate-900">
                  {serviceStatus.swagger?.admin}
                </span>
              </p>
            </div>
          ) : null}
        </CardShell>
      </div>
    </div>
  );
}
