"use client";

import { useEffect, useMemo, useState } from "react";
import { ModalShell } from "@/app/components/admin/ui/modal-shell";
import { UserAvatar } from "@/app/components/admin/ui/user-avatar";
import type { AdminRole, UpdateAdminUserInput } from "@/app/lib/admin-api";
import type { UserItem } from "@/app/types/ui";
import { formatCurrency } from "@/app/utils/admin-format";

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

export function UserEditModal({
  user,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: {
  user: UserItem;
  isSubmitting: boolean;
  submitError: string;
  onClose: () => void;
  onSubmit: (input: UpdateAdminUserInput) => Promise<void>;
}) {
  const [formState, setFormState] = useState<UpdateAdminUserInput>({
    username: user.username,
    avatar: user.avatar,
    role: user.role,
    rechargeAmount: user.rechargeAmount,
    bonusAmount: user.bonusAmount,
    createdAt: user.createdAt,
  });

  useEffect(() => {
    setFormState({
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      rechargeAmount: user.rechargeAmount,
      bonusAmount: user.bonusAmount,
      createdAt: user.createdAt,
    });
  }, [user]);

  const totalBalance = useMemo(
    () =>
      Number(formState.rechargeAmount || 0) +
      Number(formState.bonusAmount || 0),
    [formState.bonusAmount, formState.rechargeAmount],
  );

  return (
    <ModalShell
      title={`编辑用户 #${user.id}`}
      description="总余额自动计算。"
      onClose={onClose}
    >
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(formState);
        }}
      >
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <UserAvatar
            src={formState.avatar}
            alt={formState.username}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-500">头像预览</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              用户名
            </span>
            <input
              value={formState.username}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              头像地址
            </span>
            <input
              value={formState.avatar}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  avatar: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              角色
            </span>
            <select
              value={formState.role}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  role: event.target.value as AdminRole,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
            >
              <option value="user">普通用户</option>
              <option value="vip">VIP</option>
              <option value="admin">管理员</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              充值额度
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formState.rechargeAmount}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  rechargeAmount: Number(event.target.value),
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              赠送额度
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formState.bonusAmount}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  bonusAmount: Number(event.target.value),
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              required
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              创建时间
            </span>
            <input
              type="datetime-local"
              value={toDateTimeLocal(formState.createdAt)}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  createdAt: new Date(event.target.value).toISOString(),
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              required
            />
          </label>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm text-slate-500">总余额（自动计算）</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatCurrency(totalBalance)}
          </p>
        </div>

        {submitError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {submitError}
          </div>
        ) : null}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "保存中..." : "保存修改"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
