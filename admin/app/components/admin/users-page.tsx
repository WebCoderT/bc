"use client";

import { useEffect, useMemo, useState } from "react";
import { CardShell } from "@/app/components/admin/ui/card-shell";
import { StatusPill } from "@/app/components/admin/ui/status-pill";
import { TableShell } from "@/app/components/admin/ui/table-shell";
import { useAdminSession } from "@/app/components/admin/admin-session-context";
import {
  fetchAdminUsers,
  type AdminRole,
  updateAdminUserRole,
} from "@/app/lib/admin-api";
import type { UserItem } from "@/app/types/ui";
import { formatDate, formatRole } from "@/app/utils/admin-format";

export function UsersPage() {
  const { session } = useAdminSession();
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        setIsLoading(true);
        const response = await fetchAdminUsers(session.accessToken);

        if (cancelled) {
          return;
        }

        setUsers(response);
        setLoadError("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setLoadError(
          error instanceof Error ? error.message : "读取用户列表失败",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [session.accessToken]);

  const filteredUsers = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    if (!search) {
      return users;
    }

    return users.filter((item) =>
      [item.username, item.role].some((field) =>
        field.toLowerCase().includes(search),
      ),
    );
  }, [keyword, users]);

  const handleRoleChange = async (userId: number, role: AdminRole) => {
    try {
      setUpdatingUserId(userId);
      const response = await updateAdminUserRole(
        session.accessToken,
        userId,
        role,
      );
      setUsers((currentUsers) =>
        currentUsers.map((item) => (item.id === userId ? response.user : item)),
      );
      setLoadError("");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "修改角色失败");
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <CardShell
        title="用户管理"
        description="查看账号权限、部门归属与最近登录信息"
      >
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 md:max-w-sm"
            placeholder="搜索用户名或角色"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            当前共{" "}
            <span className="font-semibold text-slate-900">
              {filteredUsers.length}
            </span>{" "}
            个账号
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
                <th className="px-4 py-3 font-medium">账号</th>
                <th className="px-4 py-3 font-medium">角色</th>
                <th className="px-4 py-3 font-medium">创建时间</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={5}
                  >
                    正在读取管理员用户列表...
                  </td>
                </tr>
              ) : null}
              {filteredUsers.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-100 text-slate-700"
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {item.username}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        ID: {item.id}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill status={formatRole(item.role)} />
                  </td>
                  <td className="px-4 py-4">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-4">
                    <StatusPill
                      status={item.role === "admin" ? "启用" : "展示中"}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <select
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-400"
                      value={item.role}
                      disabled={updatingUserId === item.id}
                      onChange={(event) =>
                        void handleRoleChange(
                          item.id,
                          event.target.value as AdminRole,
                        )
                      }
                    >
                      <option value="user">普通用户</option>
                      <option value="vip">VIP</option>
                      <option value="admin">管理员</option>
                    </select>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredUsers.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={5}
                  >
                    没有匹配到用户数据。
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </TableShell>
      </CardShell>
    </div>
  );
}
