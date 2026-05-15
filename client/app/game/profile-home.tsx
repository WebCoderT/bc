"use client";

import { useMemo } from "react";
import { UserAvatar } from "@/app/shared/components/user-avatar";
import { useGameUser } from "./game-user-context";
import { ActionButton } from "@/app/shared/components/ui/action-button";
import { SectionHeading } from "@/app/shared/components/ui/section-heading";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";

const bindingItems = [
  { label: "绑定微信", field: "wechat" },
  { label: "绑定QQ", field: "qq" },
  { label: "绑定手机号", field: "phone" },
  { label: "绑定邮箱", field: "email" },
] as const;

/**
 * 已登录工作台默认首页。
 *
 * 这个组件只处理个人中心展示，不负责登录态校验与路由控制，
 * 从而保持页面层职责单一。
 */
export default function ProfileHome() {
  const user = useGameUser();

  /**
   * 将核心资料整理成可遍历数组，减少 JSX 中的重复结构。
   */
  const profileFields = useMemo(
    () => [
      { label: "名称", value: user.name },
      { label: "账号", value: user.account },
      { label: "所属组织", value: user.companyName },
      { label: "账户余额", value: `¥ ${user.balance.toFixed(2)}` },
    ],
    [user],
  );

  return (
    <main className="space-y-5">
      <section className="rounded-[2.2rem] border border-[var(--border)] bg-[linear-gradient(135deg,var(--accent),color-mix(in_srgb,var(--accent)_30%,black))] p-7 text-white shadow-[0_24px_80px_var(--glow)] lg:p-8">
        <SectionHeading
          eyebrow="PROFILE HOME"
          title="个人中心首页"
          description="这里是登录成功后的首页主区域，采用独立后台布局，中间区域聚焦展示你的账户信息、绑定状态和余额操作入口。"
          inverted
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(280px,0.82fr)]">
        <SurfaceCard padding="lg">
          <div className="flex flex-col gap-5 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <UserAvatar src={user.avatar} alt={user.name} size="lg" />
              <div>
                <p className="text-xs font-semibold tracking-[0.28em] text-[var(--accent)]">
                  ACCOUNT PROFILE
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  {user.name}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {user.account}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <ActionButton>余额充值</ActionButton>
              <ActionButton variant="outline">余额提现</ActionButton>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {profileFields.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)] p-4"
              >
                <p className="text-sm text-[var(--muted)]">{item.label}</p>
                <p className="mt-2 break-all text-lg font-semibold text-[var(--foreground)]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard padding="lg">
          <SectionHeading eyebrow="BALANCE OVERVIEW" title="钱包总览" />
          <div className="mt-6 rounded-[1.8rem] bg-[linear-gradient(135deg,var(--accent),color-mix(in_srgb,var(--accent)_22%,black))] p-5 text-white shadow-[0_18px_50px_var(--glow)]">
            <p className="text-sm text-white/75">当前账户余额</p>
            <p className="mt-3 text-4xl font-semibold">
              ¥ {user.balance.toFixed(2)}
            </p>
            <p className="mt-2 text-sm text-white/75">
              可用于服务购买、活动报名与站内权益消费。
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ActionButton className="rounded-[1.35rem] py-4" fullWidth>
              去充值
            </ActionButton>
            <ActionButton
              variant="outline"
              className="rounded-[1.35rem] py-4"
              fullWidth
            >
              去提现
            </ActionButton>
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <SurfaceCard padding="lg">
          <SectionHeading eyebrow="BINDING STATUS" title="账号绑定信息" />
          <div className="mt-6 space-y-4">
            {bindingItems.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm text-[var(--muted)]">{item.label}</p>
                  <p className="mt-1 break-all text-base font-semibold text-[var(--foreground)]">
                    {user[item.field]}
                  </p>
                </div>
                <ActionButton variant="outline" className="px-4 py-2 text-sm">
                  {user[item.field] === "未绑定" ? "立即绑定" : "修改绑定"}
                </ActionButton>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard padding="lg">
          <SectionHeading eyebrow="ACCOUNT NOTICE" title="账户说明" />
          <div className="mt-6 space-y-3">
            {[
              "头像、名称与账号信息已在个人中心同步展示。",
              "微信、QQ、手机号、邮箱支持后续补充和修改。",
              "余额充值与提现入口已放置在首页主区域和右侧服务区。",
              "后续可继续扩展真实支付、绑定校验和资金记录。",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--panel)] p-4 text-sm leading-7 text-[var(--foreground)]"
              >
                {item}
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </main>
  );
}
