import { TableShell } from "@/app/components/admin/ui/table-shell";
import type { AdminGame } from "@/app/lib/admin-api";
import { formatDate } from "@/app/utils/admin-format";
import {
  GAME_TABLE_COLUMN_COUNT,
  getGameOddsText,
  getGamePreviewText,
  getGameStatusClassName,
  getGameStatusText,
} from "@/app/utils/admin-game";

type GamesToolbarProps = {
  keyword: string;
  total: number;
  onCreate: () => void;
  onKeywordChange: (value: string) => void;
};

export function GamesToolbar({
  keyword,
  total,
  onCreate,
  onKeywordChange,
}: GamesToolbarProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex w-full flex-col gap-3 md:max-w-2xl md:flex-row">
        <input
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
          placeholder="搜索游戏名称、简介或模型 ID"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
        />
        <button
          type="button"
          onClick={onCreate}
          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          新增游戏
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        共 <span className="font-semibold text-slate-900">{total}</span> 款游戏
      </div>
    </div>
  );
}

// TODO: 设计更丰富的错误提示组件，支持不同类型的错误（网络错误、权限错误等）和操作（重试、联系客服等）
export function GamesErrorBanner({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return (
    <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {message}
    </div>
  );
}

type GamesTableProps = {
  games: AdminGame[];
  isLoading: boolean;
  categoryNameMap: ReadonlyMap<number, string>;
  gameModelNameMap: ReadonlyMap<string, string>;
  onEdit: (game: AdminGame) => void;
  onViewDraws: (game: AdminGame) => void;
  onDrawOnce: (game: AdminGame) => void;
  onDelete: (gameId: number) => void;
};

export function GamesTable({
  games,
  isLoading,
  categoryNameMap,
  gameModelNameMap,
  onEdit,
  onViewDraws,
  onDrawOnce,
  onDelete,
}: GamesTableProps) {
  return (
    <TableShell>
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">游戏</th>
            <th className="px-4 py-3 font-medium">分类</th>
            <th className="px-4 py-3 font-medium">游戏模型</th>
            <th className="px-4 py-3 font-medium">开奖间隔</th>
            <th className="px-4 py-3 font-medium">赔率配置</th>
            <th className="px-4 py-3 font-medium">状态</th>
            <th className="px-4 py-3 font-medium">简介</th>
            <th className="px-4 py-3 font-medium">图标</th>
            <th className="px-4 py-3 font-medium">创建时间</th>
            <th className="px-4 py-3 font-medium">更新时间</th>
            <th className="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td
                className="px-4 py-8 text-center text-slate-500"
                colSpan={GAME_TABLE_COLUMN_COUNT}
              >
                正在读取游戏列表...
              </td>
            </tr>
          ) : null}

          {!isLoading && games.length === 0 ? (
            <tr>
              <td
                className="px-4 py-8 text-center text-slate-500"
                colSpan={GAME_TABLE_COLUMN_COUNT}
              >
                当前筛选条件下暂无游戏。
              </td>
            </tr>
          ) : null}

          {games.map((game) => (
            <GameTableRow
              key={game.id}
              game={game}
              categoryNameMap={categoryNameMap}
              gameModelNameMap={gameModelNameMap}
              onEdit={onEdit}
              onViewDraws={onViewDraws}
              onDrawOnce={onDrawOnce}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

type GameTableRowProps = {
  game: AdminGame;
  categoryNameMap: ReadonlyMap<number, string>;
  gameModelNameMap: ReadonlyMap<string, string>;
  onEdit: (game: AdminGame) => void;
  onViewDraws: (game: AdminGame) => void;
  onDrawOnce: (game: AdminGame) => void;
  onDelete: (gameId: number) => void;
};

function GameTableRow({
  game,
  categoryNameMap,
  gameModelNameMap,
  onEdit,
  onViewDraws,
  onDrawOnce,
  onDelete,
}: GameTableRowProps) {
  return (
    <tr className="border-t border-slate-100 text-slate-700">
      <td className="px-4 py-4">
        <div>
          <p className="font-medium text-slate-900">{game.label}</p>
          <p className="mt-1 text-xs text-slate-400">ID: {game.id}</p>
        </div>
      </td>

      <td className="px-4 py-4 text-slate-600">
        {categoryNameMap.get(game.category) ?? `导航 #${game.category}`}
      </td>

      <td className="px-4 py-4 text-slate-600">
        {gameModelNameMap.get(game.gameModelId) ?? `模型 ${game.gameModelId}`}
      </td>

      <td className="px-4 py-4 text-slate-600">{game.drawInterval} 秒</td>

      <td className="px-4 py-4 text-slate-600">{getGameOddsText(game)}</td>

      <td className="px-4 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getGameStatusClassName(game.status)}`}
        >
          {getGameStatusText(game.status)}
        </span>
      </td>

      <td className="px-4 py-4 text-slate-600">{getGamePreviewText(game)}</td>

      <td className="px-4 py-4">
        {game.iconUrl ? (
          <a
            href={game.iconUrl}
            target="_blank"
            rel="noreferrer"
            className="text-violet-600 underline decoration-violet-200 underline-offset-4"
          >
            查看图标
          </a>
        ) : (
          <span className="text-slate-400">未设置</span>
        )}
      </td>

      <td className="px-4 py-4">{formatDate(game.createdAt)}</td>
      <td className="px-4 py-4">{formatDate(game.updatedAt)}</td>

      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEdit(game)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 transition hover:border-slate-300"
          >
            编辑
          </button>
          <button
            type="button"
            onClick={() => onViewDraws(game)}
            className="rounded-xl border border-violet-200 px-3 py-2 text-violet-600 transition hover:border-violet-300"
          >
            开奖历史
          </button>
          <button
            type="button"
            onClick={() => onDrawOnce(game)}
            className="rounded-xl border border-emerald-200 px-3 py-2 text-emerald-600 transition hover:border-emerald-300"
          >
            立即开奖
          </button>
          <button
            type="button"
            onClick={() => onDelete(game.id)}
            className="rounded-xl border border-rose-200 px-3 py-2 text-rose-600 transition hover:border-rose-300"
          >
            删除
          </button>
        </div>
      </td>
    </tr>
  );
}
