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
    <SurfaceCard className="border-dashed p-10 text-center">
      <p className="text-lg font-semibold text-[var(--foreground)]">
        {title} 页面暂未填充内容
      </p>
      <p className="mt-3 text-sm text-[var(--muted)]">
        当前仅创建空页面与路由占位，便于后续继续扩展。
      </p>
    </SurfaceCard>
  );
}
