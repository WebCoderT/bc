"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthMode, writeStoredUser } from "../lib/auth";
import { AppBrand } from "@/app/shared/components/app-brand";
import { ActionButton } from "@/app/shared/components/ui/action-button";
import { getAppProfileSync } from "@/app/shared/repositories/app-profile-repository";

/**
 * 登录/注册弹窗组件。
 *
 * 这里保留最小输入项，复杂的用户字段填充交给认证模块完成，
 * 从而让弹窗只关心交互，不关心数据标准化细节。
 */

export function AuthModal({
  mode,
  onModeChange,
  onClose,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
}) {
  const appProfile = getAppProfileSync();
  const router = useRouter();
  const [companyName, setCompanyName] = useState(
    appProfile.defaultOrganizationName,
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * 提交后写入本地登录态，并进入 `/game` 已登录区域。
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const safeName = name.trim() || "竞技用户";
    const user = {
      companyName: companyName.trim() || appProfile.defaultOrganizationName,
      name: safeName,
      email:
        email.trim() ||
        `${safeName.toLowerCase()}@${appProfile.defaultEmailDomain}`,
    };

    writeStoredUser(user);
    setPassword("");
    onClose();
    router.push("/game");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_30px_80px_var(--glow)]">
        <div className="bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-6 py-6 text-white">
          <AppBrand
            caption={appProfile.consoleLabel}
            secondaryText="统一品牌数据已接入认证入口"
            variant="inverted"
          />
          <h2 className="mt-3 text-2xl font-semibold">
            {mode === "login" ? "登录竞技中枢" : "注册并解锁赛场"}
          </h2>
          <p className="mt-2 text-sm text-white/80">
            {mode === "login"
              ? "登录成功后进入 `/game` 已登录模块。"
              : "注册成功后自动进入 `/game` 首页。"}
          </p>
        </div>

        <div className="p-6">
          <div className="mb-6 grid grid-cols-2 rounded-full border border-[var(--border)] bg-[var(--panel)] p-1 text-sm">
            <ActionButton
              onClick={() => onModeChange("login")}
              type="button"
              variant="soft"
              className={`rounded-full px-4 py-2 font-medium transition ${
                mode === "login"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              登录
            </ActionButton>
            <ActionButton
              onClick={() => onModeChange("register")}
              type="button"
              variant="soft"
              className={`rounded-full px-4 py-2 font-medium transition ${
                mode === "register"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              注册
            </ActionButton>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "register" ? (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  战队 / 公司名称
                </span>
                <input
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                  placeholder="请输入组织名称"
                  required
                />
              </label>
            ) : null}

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--foreground)]">
                昵称
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                placeholder="请输入昵称"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--foreground)]">
                邮箱
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                placeholder={`team@${appProfile.defaultEmailDomain}`}
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--foreground)]">
                密码
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                placeholder="至少 6 位"
                minLength={6}
                required
              />
            </label>

            <div className="flex gap-3 pt-2">
              <ActionButton
                onClick={onClose}
                type="button"
                variant="outline"
                fullWidth
                className="flex-1"
              >
                取消
              </ActionButton>
              <ActionButton type="submit" fullWidth className="flex-1">
                {mode === "login" ? "进入 /game" : "注册并进入"}
              </ActionButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
