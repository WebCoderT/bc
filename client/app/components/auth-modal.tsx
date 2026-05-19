"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthMode,
  loginGameSession,
  registerAndLoginGameSession,
  writeStoredSession,
} from "../lib/auth";
import { AppBrand } from "@/app/shared/components/app-brand";
import { ModalShell } from "@/app/shared/components/ui/modal-shell";
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  /**
   * 提交后调用服务端认证接口，写入 JWT 会话，并进入 `/game` 已登录区域。
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const trimmedUsername = username.trim();

      const session =
        mode === "login"
          ? await loginGameSession({
              username: trimmedUsername,
              password,
            })
          : await registerAndLoginGameSession({
              username: trimmedUsername,
              password,
            });

      writeStoredSession(session);
      setPassword("");
      onClose();
      router.push("/game");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "认证失败，请稍后重试",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      title={mode === "login" ? "登录竞技中枢" : "注册并解锁赛场"}
      description={
        mode === "login"
          ? "使用服务端 JWT 登录后进入 `/game` 已登录模块。"
          : "当前服务端注册接口仅接收用户名与密码，注册成功后自动登录。"
      }
      onClose={onClose}
      maxWidthClassName="max-w-md"
      headerContent={
        <AppBrand
          secondaryText="统一品牌数据已接入认证入口"
          variant="inverted"
        />
      }
      bodyClassName="p-[var(--surface-padding-lg)]"
    >
      <div className="mb-5 grid grid-cols-2 rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--panel)] p-1 text-sm">
        <ActionButton
          onClick={() => onModeChange("login")}
          type="button"
          variant="soft"
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--foreground)]">
            用户名
          </span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-[var(--surface-radius-md)] border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            placeholder="请输入用户名，仅支持字母、数字和下划线"
            pattern="[A-Za-z0-9_]+"
            minLength={3}
            maxLength={20}
            autoComplete="username"
            disabled={isSubmitting}
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
            className="w-full rounded-[var(--surface-radius-md)] border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            placeholder="请输入密码"
            minLength={6}
            maxLength={32}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            disabled={isSubmitting}
            required
          />
        </label>

        {submitError ? (
          <div className="rounded-[var(--surface-radius-md)] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {submitError}
          </div>
        ) : null}

        <div className="flex gap-3 pt-2">
          <ActionButton
            onClick={onClose}
            type="button"
            variant="outline"
            disabled={isSubmitting}
            fullWidth
            className="flex-1"
          >
            取消
          </ActionButton>
          <ActionButton
            type="submit"
            disabled={isSubmitting}
            fullWidth
            className="flex-1"
          >
            {isSubmitting
              ? mode === "login"
                ? "登录中..."
                : "注册中..."
              : mode === "login"
                ? "进入 /game"
                : "注册并进入"}
          </ActionButton>
        </div>
      </form>
    </ModalShell>
  );
}
