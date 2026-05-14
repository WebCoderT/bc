import type { AdminRole } from "@/app/lib/admin-api";
import { routeItems } from "@/app/routes/route-items";
import type { RouteItem, Tone } from "@/app/types/ui";

export const toneMap: Record<Tone, string> = {
  violet:
    "from-violet-500/20 via-violet-500/10 to-transparent text-violet-200 ring-violet-400/20",
  emerald:
    "from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-200 ring-emerald-400/20",
  sky: "from-sky-500/20 via-sky-500/10 to-transparent text-sky-200 ring-sky-400/20",
  amber:
    "from-amber-500/20 via-amber-500/10 to-transparent text-amber-200 ring-amber-400/20",
  rose: "from-rose-500/20 via-rose-500/10 to-transparent text-rose-200 ring-rose-400/20",
};

export function getStatusClass(status: string) {
  if (["启用", "展示中", "运营中", "已启用"].includes(status)) {
    return "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20";
  }

  if (["预约中", "待调整"].includes(status)) {
    return "bg-amber-500/10 text-amber-700 ring-amber-500/20";
  }

  return "bg-rose-500/10 text-rose-700 ring-rose-500/20";
}

export function getCurrentRouteMeta(pathname: string): RouteItem {
  return routeItems.find((item) => item.path === pathname) ?? routeItems[0];
}

export function formatRole(role: AdminRole) {
  if (role === "admin") {
    return "管理员";
  }

  if (role === "vip") {
    return "VIP";
  }

  return "普通用户";
}

export function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  }).format(value);
}
