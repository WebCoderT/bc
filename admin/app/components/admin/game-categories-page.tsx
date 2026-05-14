import { CardShell } from "@/app/components/admin/ui/card-shell";
import { StatusPill } from "@/app/components/admin/ui/status-pill";
import { SuggestionCard } from "@/app/components/admin/ui/suggestion-card";
import { categoryItems } from "@/app/data/admin-data";

export function GameCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {categoryItems.map((item) => (
          <CardShell
            key={item.id}
            title={item.name}
            description={item.description}
          >
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4">
              <div>
                <p className="text-sm text-slate-500">已收录游戏数</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {item.gameCount}
                </p>
              </div>
              <StatusPill status={item.status} />
            </div>
          </CardShell>
        ))}
      </div>

      <CardShell
        title="分类策略建议"
        description="方便运营继续扩展真实表单和接口逻辑"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <SuggestionCard
            title="补充标签维度"
            detail="为分类增加推荐位、热度值、SEO 标识与渠道标签字段。"
          />
          <SuggestionCard
            title="增加分类排序"
            detail="支持拖拽排序与状态切换，便于前台分类页灵活运营。"
          />
          <SuggestionCard
            title="接入统计指标"
            detail="结合点击、下载、留存数据评估分类承载效果。"
          />
        </div>
      </CardShell>
    </div>
  );
}
