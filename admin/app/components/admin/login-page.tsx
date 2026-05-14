"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import { useRouter } from "next/navigation";
import { InfoCard } from "@/app/components/admin/ui/info-card";
import { LoadingScreen } from "@/app/components/admin/ui/loading-screen";
import {
  loginAdmin,
  readStoredAdminSession,
  writeStoredAdminSession,
} from "@/app/lib/admin-api";

export function LoginPage() {
  const router = useRouter();
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const session = isClient ? readStoredAdminSession() : null;
  const [username, setUsername] = useState("admin_root");
  const [password, setPassword] = useState("Admin@123");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isClient && session?.accessToken) {
      router.replace("/dashboard");
    }
  }, [isClient, router, session?.accessToken]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const nextSession = await loginAdmin(username.trim(), password.trim());

      if (nextSession.user.role !== "admin") {
        setErrorMessage("当前账号不是管理员，无法进入后台。");
        return;
      }

      writeStoredAdminSession(nextSession);
      setErrorMessage("");
      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "登录失败，请稍后重试",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isClient || session?.accessToken) {
    return <LoadingScreen title="正在检查登录状态..." />;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hidden flex-col justify-between border-r border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.28),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))] p-14 lg:flex">
          <div>
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-slate-300">
              Game Admin Console
            </span>
            <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-tight">
              游戏运营、用户、导航一体化管理后台
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              面向运营团队的统一工作台，覆盖登录鉴权、用户权限、导航配置、游戏资产与分类管理，适合中后台项目快速起步。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <InfoCard
              title="登录鉴权"
              value="真实接口"
              detail="支持路由守卫与退出登录"
            />
            <InfoCard title="模块数量" value="5 个" detail="覆盖常见后台功能" />
            <InfoCard
              title="默认账号"
              value="admin_root"
              detail="密码：Admin@123"
            />
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-8 text-slate-900 shadow-2xl shadow-slate-950/30 backdrop-blur">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-violet-600">
                运营后台
              </p>
              <h2 className="mt-3 text-3xl font-semibold">欢迎登录</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                已切换为真实接口登录，请使用 Swagger
                文档中的管理员账号：`admin_root / Admin@123`
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  账号
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="请输入账号"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  密码
                </span>
                <input
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="请输入密码"
                />
              </label>

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "登录中..." : "登录后台"}
              </button>
            </form>

            <div className="mt-8 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>推荐入口</span>
                <span className="font-medium text-slate-900">Dashboard</span>
              </div>
              <div className="flex items-center justify-between">
                <span>当前框架</span>
                <span className="font-medium text-slate-900">
                  Next 16 App Router
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>接口状态</span>
                <span className="font-medium text-emerald-600">
                  Swagger 已接入
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
