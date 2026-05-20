import { GameCurrentIssueResponseDtoStatusEnum } from "@/app/generated/admin-api/data-contracts";
import type { AdminNavigation } from "@/app/lib/admin-api";
import type { AlertTone } from "./dashboard.types";

export const DASHBOARD_PAGE_SIZE = 100;
export const DASHBOARD_CURRENT_ISSUE_LIMIT = 4;
export const DASHBOARD_SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function collectPaginatedItems<
  TItem,
  TResponse extends {
    items: TItem[];
    total: number;
    totalPages: number;
  },
>(
  loadPage: (page: number, pageSize: number) => Promise<TResponse>,
  pageSize = DASHBOARD_PAGE_SIZE,
) {
  const firstPage = await loadPage(1, pageSize);

  if (firstPage.totalPages <= 1) {
    return {
      total: firstPage.total,
      items: firstPage.items,
    };
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      loadPage(index + 2, pageSize),
    ),
  );

  return {
    total: firstPage.total,
    items: [
      ...firstPage.items,
      ...remainingPages.flatMap((page) => page.items),
    ],
  };
}

export function flattenNavigations(
  items: AdminNavigation[],
): AdminNavigation[] {
  return items.flatMap((item) => [item, ...flattenNavigations(item.children)]);
}

export function toTimestamp(value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(value >= 0.1 ? 1 : 2)}%`;
}

export function formatCompactCount(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

export function formatIssueNo(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object") {
    if ("issueNo" in value) {
      const issueNo = (value as { issueNo?: unknown }).issueNo;

      if (typeof issueNo === "string" || typeof issueNo === "number") {
        return String(issueNo);
      }
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "--";
    }
  }

  return "--";
}

export function formatIssueStatus(
  status: GameCurrentIssueResponseDtoStatusEnum,
) {
  if (status === GameCurrentIssueResponseDtoStatusEnum.Drawing) {
    return "开奖中";
  }

  if (status === GameCurrentIssueResponseDtoStatusEnum.Paused) {
    return "已暂停";
  }

  if (status === GameCurrentIssueResponseDtoStatusEnum.Error) {
    return "异常";
  }

  return "待开奖";
}

export function getIssueStatusClassName(
  status: GameCurrentIssueResponseDtoStatusEnum,
) {
  if (
    status === GameCurrentIssueResponseDtoStatusEnum.Idle ||
    status === GameCurrentIssueResponseDtoStatusEnum.Drawing
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === GameCurrentIssueResponseDtoStatusEnum.Paused) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-rose-200 bg-rose-50 text-rose-700";
}

export function getAlertToneClassName(tone: AlertTone) {
  if (tone === "emerald") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (tone === "sky") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  if (tone === "rose") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}
