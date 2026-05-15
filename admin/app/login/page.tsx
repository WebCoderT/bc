"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import { useRouter } from "next/navigation";
import { InfoCard } from "@/app/components/admin/ui/info-card";
import { LoadingScreen } from "@/app/components/admin/ui/loading-screen";
import {
  clearStoredAdminSession,
  isAdminTokenExpired,
  loginAdmin,
  readStoredAdminSession,
  validateAdminSession,
  writeStoredAdminSession,
} from "@/app/lib/admin-api";

export default function LoginRoute() {
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
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      if (!isClient || !session?.accessToken) {
        setIsCheckingSession(false);
        return;
      }

      if (isAdminTokenExpired(session.accessToken)) {
        clearStoredAdminSession();
        setIsCheckingSession(false);
        return;
      }

      try {
        const validatedSession = await validateAdminSession(
          session.accessToken,
        );

        if (cancelled) {
          return;
        }

        writeStoredAdminSession(validatedSession);
        router.replace("/dashboard");
      } catch {
        clearStoredAdminSession();
      } finally {
        if (!cancelled) {
          setIsCheckingSession(false);
        }
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
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

  if (!isClient || isCheckingSession) {
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
              运营管理后台
            </h1>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <InfoCard title="登录鉴权" value="JWT" detail="已启用" />
            <InfoCard title="模块数量" value="5 个" />
            <InfoCard title="默认账号" value="admin_root" />
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-8 text-slate-900 shadow-2xl shadow-slate-950/30 backdrop-blur">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-violet-600">
                运营后台
              </p>
              <h2 className="mt-3 text-3xl font-semibold">欢迎登录</h2>
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
          </div>
        </section>
      </div>
    </main>
  );
}
