"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AppProfileResponseDto,
  UpdateAppProfileDto,
} from "@/app/generated/admin-api/data-contracts";
import { useAdminSession } from "@/app/components/admin/admin-session-context";
import { CardShell } from "@/app/components/admin/ui/card-shell";
import { MetricPanel } from "@/app/components/admin/ui/metric-panel";
import {
  executeAdminRequest,
  fetchAdminAppProfile,
  updateAdminAppProfile,
} from "@/app/lib/admin-api";

type BrandFormState = Omit<AppProfileResponseDto, "updatedAt">;

function createEmptyFormState(): BrandFormState {
  return {
    appName: "",
    appWordmark: "",
    logoText: "",
    description: "",
    officialSiteLabel: "",
    defaultOrganizationName: "",
    defaultEmailDomain: "",
    defaultUserAvatar: "",
  };
}

function toFormState(profile: AppProfileResponseDto): BrandFormState {
  return {
    appName: profile.appName,
    appWordmark: profile.appWordmark,
    logoText: profile.logoText,
    description: profile.description,
    officialSiteLabel: profile.officialSiteLabel,
    defaultOrganizationName: profile.defaultOrganizationName,
    defaultEmailDomain: profile.defaultEmailDomain,
    defaultUserAvatar: profile.defaultUserAvatar,
  };
}

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return "未记录";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function BrandRoute() {
  const { session, logout } = useAdminSession();
  const [profile, setProfile] = useState<AppProfileResponseDto | null>(null);
  const [form, setForm] = useState<BrandFormState>(() =>
    createEmptyFormState(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    await executeAdminRequest({
      onStart: () => setIsLoading(true),
      request: () => fetchAdminAppProfile(session.accessToken),
      fallbackMessage: "读取品牌资料失败",
      onSuccess: (result) => {
        setProfile(result);
        setForm(toFormState(result));
        setLoadError("");
      },
      onError: (message) => setLoadError(message),
      onAuthError: logout,
      onFinally: () => setIsLoading(false),
    });
  }, [logout, session.accessToken]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const previewTitle = useMemo(
    () => form.appName?.trim() || "应用名称预览",
    [form.appName],
  );

  const handleChange = <K extends keyof BrandFormState>(
    key: K,
    value: BrandFormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleReset = () => {
    if (!profile) {
      return;
    }

    setForm(toFormState(profile));
    setSubmitError("");
    setSubmitSuccess("");
  };

  const handleSubmit = async () => {
    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()]),
    ) as UpdateAppProfileDto;

    if (!payload.appName) {
      setSubmitError("应用名称不能为空");
      return;
    }

    if (!payload.logoText) {
      setSubmitError("Logo 简写不能为空");
      return;
    }

    await executeAdminRequest({
      onStart: () => {
        setIsSubmitting(true);
        setSubmitError("");
        setSubmitSuccess("");
      },
      request: () => updateAdminAppProfile(session.accessToken, payload),
      fallbackMessage: "保存品牌资料失败",
      onSuccess: (result) => {
        console.log(result);
        setProfile(result);
        setForm(toFormState(result));
        setSubmitSuccess("品牌资料已更新，前端刷新后会读取最新配置。");
      },
      onError: (message) => setSubmitError(message),
      onAuthError: logout,
      onFinally: () => setIsSubmitting(false),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricPanel
          title="品牌简称"
          value={form.logoText || "--"}
          hint="站点 Logo 与导航角标使用"
        />
        <MetricPanel
          title="官网字标"
          value={form.appWordmark || "--"}
          hint="首页主视觉与品牌辅助文案"
        />
        <MetricPanel
          title="最近更新"
          value={formatUpdatedAt(profile?.updatedAt ?? null)}
          hint="保存成功后会同步写入更新时间"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <CardShell
          title="品牌资料管理"
          description="统一维护客户端首页、认证入口和通用品牌组件使用的品牌数据。"
        >
          {loadError ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {loadError}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">应用名称</span>
              <input
                value={form.appName}
                onChange={(event) =>
                  handleChange("appName", event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
                placeholder="应用名称"
                disabled={isLoading || isSubmitting}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">英文品牌字标</span>
              <input
                value={form.appWordmark}
                onChange={(event) =>
                  handleChange("appWordmark", event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
                placeholder="英文品牌字标"
                disabled={isLoading || isSubmitting}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">Logo 简写</span>
              <input
                value={form.logoText}
                onChange={(event) =>
                  handleChange("logoText", event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
                placeholder="例如：PP"
                disabled={isLoading || isSubmitting}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">官网标识</span>
              <input
                value={form.officialSiteLabel}
                onChange={(event) =>
                  handleChange("officialSiteLabel", event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
                placeholder="例如：PULSEPLAY LAB"
                disabled={isLoading || isSubmitting}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
              <span className="font-medium text-slate-900">品牌描述</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
                placeholder="用于首页描述与站点基础说明"
                disabled={isLoading || isSubmitting}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">默认组织名称</span>
              <input
                value={form.defaultOrganizationName}
                onChange={(event) =>
                  handleChange("defaultOrganizationName", event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
                placeholder="注册默认组织名"
                disabled={isLoading || isSubmitting}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">默认邮箱域名</span>
              <input
                value={form.defaultEmailDomain}
                onChange={(event) =>
                  handleChange("defaultEmailDomain", event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
                placeholder="例如：pulseplay.com"
                disabled={isLoading || isSubmitting}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
              <span className="font-medium text-slate-900">
                默认头像 URL / SVG
              </span>
              <textarea
                value={form.defaultUserAvatar}
                onChange={(event) =>
                  handleChange("defaultUserAvatar", event.target.value)
                }
                className="min-h-36 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs outline-none transition focus:border-violet-400 focus:bg-white"
                placeholder="支持 URL 或 data:image/svg+xml"
                disabled={isLoading || isSubmitting}
              />
            </label>
          </div>

          {submitError ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {submitError}
            </div>
          ) : null}

          {submitSuccess ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {submitSuccess}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                void loadProfile();
              }}
              disabled={isLoading || isSubmitting}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              刷新配置
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={!profile || isSubmitting}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              重置表单
            </button>
            <button
              type="button"
              onClick={() => {
                void handleSubmit();
              }}
              disabled={isLoading || isSubmitting}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "保存中..." : "保存品牌资料"}
            </button>
          </div>
        </CardShell>

        <CardShell
          title="实时预览"
          description="用于确认首页与通用品牌组件大致会如何展示。"
        >
          <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500 text-sm font-semibold">
                {form.logoText || "--"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold tracking-[0.24em] text-violet-200">
                  {form.officialSiteLabel || "OFFICIAL SITE"}
                </p>
                <h3 className="truncate text-xl font-semibold">
                  {previewTitle}
                </h3>
                <p className="truncate text-sm text-slate-300">
                  {form.appWordmark || "BRAND WORDMARK"}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-300">
              {form.description ||
                "品牌描述将在这里展示，方便校验首页文案与整体气质。"}
            </p>

            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                默认组织：{form.defaultOrganizationName || "未填写"}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                默认邮箱域名：{form.defaultEmailDomain || "未填写"}
              </div>
            </div>
          </div>
        </CardShell>
      </div>
    </div>
  );
}
