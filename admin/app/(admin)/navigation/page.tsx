import { MetricPanel } from "@/app/components/admin/ui/metric-panel";
import { StatusPill } from "@/app/components/admin/ui/status-pill";
import { TableShell } from "@/app/components/admin/ui/table-shell";
import { CardShell } from "@/app/components/admin/ui/card-shell";
import { navigationItems } from "@/app/data/admin-data";

export default function NavigationRoute() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricPanel title="展示中入口" value="4" hint="含顶部导航与快捷入口" />
        <MetricPanel title="隐藏入口" value="1" hint="待运营排期后上线" />
        <MetricPanel
          title="平均点击转化"
          value="18.4%"
          hint="较上周提升 2.1%"
        />
      </div>

      <CardShell
        title="导航管理"
        description="统一管理前台入口、后台菜单与排序权重"
      >
        <TableShell>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">导航名称</th>
                <th className="px-4 py-3 font-medium">路径</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">排序</th>
                <th className="px-4 py-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {navigationItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-100 text-slate-700"
                >
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-4 text-slate-500">{item.path}</td>
                  <td className="px-4 py-4">{item.type}</td>
                  <td className="px-4 py-4">#{item.sort}</td>
                  <td className="px-4 py-4">
                    <StatusPill status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      </CardShell>
    </div>
  );
}
