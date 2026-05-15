"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminSession } from "@/app/components/admin/admin-session-context";
import { UserEditModal } from "@/app/components/admin/user-edit-modal";
import { CardShell } from "@/app/components/admin/ui/card-shell";
import { PaginationControls } from "@/app/components/admin/ui/pagination-controls";
import { StatusPill } from "@/app/components/admin/ui/status-pill";
import { TableShell } from "@/app/components/admin/ui/table-shell";
import { UserAvatar } from "@/app/components/admin/ui/user-avatar";
import {
  fetchAdminUsers,
  isAdminAuthError,
  RoleEnum,
  type AdminRoleFilter,
  updateAdminUser,
  type UpdateAdminUserInput,
} from "@/app/lib/admin-api";
import type { UserItem } from "@/app/types/ui";
import {
  formatCurrency,
  formatDate,
  formatRole,
} from "@/app/utils/admin-format";

const PAGE_SIZE = 5;

export default function UsersRoute() {
  const { session, logout } = useAdminSession();
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminRoleFilter | "all">("all");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchAdminUsers(session.accessToken, {
        page,
        pageSize: PAGE_SIZE,
        role: roleFilter,
        keyword,
      });

      setUsers(response.items);
      setPagination({
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
      });
      setLoadError("");
    } catch (error) {
      if (isAdminAuthError(error)) {
        logout();
        return;
      }

      setLoadError(error instanceof Error ? error.message : "读取用户列表失败");
    } finally {
      setIsLoading(false);
    }
  }, [keyword, logout, page, roleFilter, session.accessToken]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUsers();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadUsers]);

  const roleSummary = useMemo(() => {
    if (roleFilter === "all") {
      return "全部角色";
    }

    return formatRole(roleFilter);
  }, [roleFilter]);

  const handleSaveUser = async (input: UpdateAdminUserInput) => {
    if (!selectedUser) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      await updateAdminUser(session.accessToken, selectedUser.id, input);
      await loadUsers();
      setSelectedUser(null);
    } catch (error) {
      if (isAdminAuthError(error)) {
        logout();
        return;
      }

      setSubmitError(error instanceof Error ? error.message : "更新用户失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <CardShell title="用户管理">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3 md:max-w-2xl md:flex-row">
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
              placeholder="搜索用户名"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
            />
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value as AdminRoleFilter | "all");
                setPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 md:w-52"
            >
              <option value="all">全部角色</option>
              <option value={RoleEnum.User}>普通用户</option>
              <option value={RoleEnum.Vip}>VIP</option>
              <option value={RoleEnum.Admin}>管理员</option>
            </select>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            共
            <span className="font-semibold text-slate-900">
              {" "}
              {pagination.total}{" "}
            </span>
            个账号 · {roleSummary}
          </div>
        </div>
        {loadError ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {loadError}
          </div>
        ) : null}
        <TableShell>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">用户</th>
                <th className="px-4 py-3 font-medium">角色</th>
                <th className="px-4 py-3 font-medium">充值额度</th>
                <th className="px-4 py-3 font-medium">赠送额度</th>
                <th className="px-4 py-3 font-medium">总余额</th>
                <th className="px-4 py-3 font-medium">创建时间</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={7}
                  >
                    正在读取管理员用户列表...
                  </td>
                </tr>
              ) : null}
              {users.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-100 text-slate-700"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        src={item.avatar}
                        alt={item.username}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-slate-900">
                          {item.username}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          ID: {item.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill status={formatRole(item.role)} />
                  </td>
                  <td className="px-4 py-4">
                    {formatCurrency(item.rechargeAmount)}
                  </td>
                  <td className="px-4 py-4">
                    {formatCurrency(item.bonusAmount)}
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {formatCurrency(item.totalBalance)}
                  </td>
                  <td className="px-4 py-4">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitError("");
                        setSelectedUser(item);
                      }}
                      className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      编辑用户
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && users.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={7}
                  >
                    没有匹配到用户数据。
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </TableShell>

        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(nextPage) => setPage(nextPage)}
        />
      </CardShell>

      {selectedUser ? (
        <UserEditModal
          user={selectedUser}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onClose={() => {
            setSubmitError("");
            setSelectedUser(null);
          }}
          onSubmit={handleSaveUser}
        />
      ) : null}
    </div>
  );
}
