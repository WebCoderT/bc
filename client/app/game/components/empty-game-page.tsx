import { SectionHeading } from "@/app/shared/components/ui/section-heading";
import { SurfaceCard } from "@/app/shared/components/ui/surface-card";

type EmptyGamePageProps = {
  title: string;
};

/**
 * 已登录区域的通用空页面。
 *
 * 当一级/二级导航还没有正式业务实现时，使用统一的占位页
 * 能保持体验一致，也方便后续逐个替换为真实页面。
 */
export function EmptyGamePage({ title }: EmptyGamePageProps) {
  return (
    <main className="space-y-5">
      <section className="rounded-[2.2rem] border border-[var(--border)] bg-[linear-gradient(135deg,var(--accent),color-mix(in_srgb,var(--accent)_24%,black))] p-7 text-white shadow-[0_24px_80px_var(--glow)] lg:p-8">
        <SectionHeading
          eyebrow="EMPTY PAGE"
          title={title}
          description="这是根据顶部导航生成的空页面占位，后续可以在这里继续补充业务内容。"
          inverted
        />
      </section>

      <SurfaceCard className="border-dashed p-10 text-center">
        <p className="text-lg font-semibold text-[var(--foreground)]">
          {title} 页面暂未填充内容
        </p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          当前仅创建空页面与路由占位，便于后续继续扩展。
        </p>
      </SurfaceCard>
    </main>
  );
}
