"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminSession } from "@/app/components/admin/admin-session-context";
import { executeAdminRequest } from "@/app/lib/admin-api";
import {
  DashboardContent,
  DashboardEmptyState,
} from "./_components/dashboard-content";
import { loadDashboardSnapshot } from "./_components/dashboard.data";
import { deriveDashboardMetrics } from "./_components/dashboard.metrics";
import type { DashboardSnapshot } from "./_components/dashboard.types";

export default function DashboardRoute() {
  const { session, logout } = useAdminSession();
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadDashboardData = useCallback(async () => {
    await executeAdminRequest({
      onStart: () => {
        setIsLoading(true);
        setLoadError("");
      },
      request: () => loadDashboardSnapshot(session.accessToken),
      fallbackMessage: "读取仪表盘数据失败",
      onSuccess: (result) => {
        setSnapshot(result);
      },
      onError: (message) => setLoadError(message),
      onAuthError: logout,
      onFinally: () => setIsLoading(false),
    });
  }, [logout, session.accessToken]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const metrics = useMemo(() => {
    if (!snapshot) {
      return null;
    }

    return deriveDashboardMetrics(snapshot);
  }, [snapshot]);

  if (!snapshot || !metrics) {
    return <DashboardEmptyState isLoading={isLoading} loadError={loadError} />;
  }

  return (
    <DashboardContent
      snapshot={snapshot}
      metrics={metrics}
      loadError={loadError}
      onRefresh={() => {
        void loadDashboardData();
      }}
    />
  );
}
