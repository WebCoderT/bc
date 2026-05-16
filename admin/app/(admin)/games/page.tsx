"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminSession } from "@/app/components/admin/admin-session-context";
import { GameEditModal } from "@/app/components/admin/game-edit-modal";
import { CardShell } from "@/app/components/admin/ui/card-shell";
import { PaginationControls } from "@/app/components/admin/ui/pagination-controls";
import { TableShell } from "@/app/components/admin/ui/table-shell";
import {
  createAdminGame,
  deleteAdminGame,
  executeAdminRequest,
  fetchAdminNavigations,
  fetchAdminGames,
  GameResponseDtoStatusEnum,
  NavigationResponseDtoTypeEnum,
  type AdminGame,
  type AdminNavigation,
  type SaveAdminGameInput,
  type UpdateAdminGameInput,
  updateAdminGame,
} from "@/app/lib/admin-api";
import { formatDate } from "@/app/utils/admin-format";

// 列表页固定每页展示数量，保持分页交互稳定。
const PAGE_SIZE = 8;

/**
 * 列表中的简介只展示简短摘要，避免单元格高度被长文本撑开。
 */
function getGamePreviewText(game: AdminGame) {
  return game.description.length > 60
    ? `${game.description.slice(0, 60)}...`
    : game.description;
}

/**
 * 游戏管理页面负责串联列表读取、分类选项加载以及新增编辑弹窗状态。
 * 页面本身不持有复杂业务规则，主要职责是把 API 状态投影为管理台界面。
 */
export default function GamesRoute() {
  const { session, logout } = useAdminSession();
  // 搜索关键字直接绑定输入框。
  // keyword 和 page 共同决定当前列表查询条件。
  const [keyword, setKeyword] = useState("");
  // page 由分页器和搜索框重置逻辑共同驱动。
  const [page, setPage] = useState(1);
  // games 始终保存当前页结果，不缓存历史页数据。
  // games 保存当前页数据，categoryOptions 提供表单和列表展示所需的分类名称。
  const [games, setGames] = useState<AdminGame[]>([]);
  // 分类选项来源于导航接口，供表单下拉框选择。
  const [categoryOptions, setCategoryOptions] = useState<AdminNavigation[]>([]);
  // 首次进入和翻页时都通过 isLoading 控制占位提示。
  // isLoading 与 loadError 控制列表区域的加载态和错误态。
  const [isLoading, setIsLoading] = useState(true);
  // loadError 统一承接列表与分类请求失败信息。
  const [loadError, setLoadError] = useState("");
  // selectedGame 不为空时代表弹窗进入编辑状态。
  // 通过 selectedGame 和 isCreating 区分当前是编辑模式还是新增模式。
  const [selectedGame, setSelectedGame] = useState<AdminGame | null>(null);
  // isCreating 为 true 且 selectedGame 为空时表示新增弹窗。
  const [isCreating, setIsCreating] = useState(false);
  // 表单保存期间禁用提交，避免重复发送请求。
  // 弹窗内部的提交过程独立维护状态，避免影响主列表加载态。
  const [isSubmitting, setIsSubmitting] = useState(false);
  // submitError 只展示在弹窗内部，不污染页面级错误区域。
  const [submitError, setSubmitError] = useState("");
  // total 用于顶部统计展示。
  // page 和 totalPages 用于分页器同步。
  // pageSize 直接回显服务端采用的分页尺寸。
  // 服务端返回的分页元信息直接缓存下来，供分页组件和统计展示复用。
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 1,
  });

  // 映射表的 key 是分类导航 id。
  // 映射表的 value 是分类显示名称。
  // 预先把分类数组转成 Map，避免表格逐行渲染时重复线性查找。
  const categoryNameMap = useMemo(
    () =>
      new Map(categoryOptions.map((item) => [item.id, item.name] as const)),
    [categoryOptions],
  );

  /**
   * 分类接口返回树形导航，这里拍平成数组供下拉框和列表名称映射复用。
   * 页面只关心导航 id 和名称的对应关系，不需要保留树结构层级。
   */
  const loadCategoryOptions = useCallback(async () => {
    await executeAdminRequest({
      // 这里读取的是侧边导航类型，因为游戏分类当前挂在该导航体系下。
      request: () => fetchAdminNavigations(session.accessToken, {}),
      fallbackMessage: "读取游戏分类导航失败",
      onSuccess: (response) => {
        // 顶级和子级导航都可能作为游戏分类，因此统一打平成单层数组。
        // 打平后既能给编辑弹窗复用，也能给表格映射分类名。
        const flattened = response.items.flatMap((item) => [item, ...item.children]);
        setCategoryOptions(flattened);
      },
      // 分类读取失败时复用页面级错误提示区域。
      onError: (message) => setLoadError(message),
      // 鉴权错误统一走登出，让会话层处理跳转和凭证清理。
      onAuthError: logout,
    });
  }, [logout, session.accessToken]);

  /**
   * 列表读取由关键字和页码驱动，成功后同步刷新分页信息。
   * 这个函数会被初次加载、搜索和翻页三个入口共用。
   */
  const loadGames = useCallback(async () => {
    await executeAdminRequest({
      // 每次重新请求前进入加载态，保证表格内容与查询条件同步。
      onStart: () => setIsLoading(true),
      // 服务端分页参数由页面状态直接生成，避免本地再维护额外查询对象。
      request: () =>
        fetchAdminGames(session.accessToken, {
          page,
          pageSize: PAGE_SIZE,
          keyword,
        }),
      fallbackMessage: "读取游戏列表失败",
      onSuccess: (response) => {
        // items 和分页元信息来自同一次响应，需要一起更新。
        // 先落地列表数据，再写分页信息，阅读时更符合结果结构。
        setGames(response.items);
        setPagination({
          total: response.total,
          page: response.page,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
        });
        // 请求成功后清掉旧错误，避免旧提示残留在新结果上方。
        setLoadError("");
      },
      // 其余错误保留原始消息，便于后台排查接口返回内容。
      onError: (message) => setLoadError(message),
      // 会话失效时不再展示普通错误文案，直接交给登出流程处理。
      onAuthError: logout,
      // 无论成功失败都退出加载态，确保空态或错误态可以正常显示。
      onFinally: () => setIsLoading(false),
    });
  }, [keyword, logout, page, session.accessToken]);

  // 把首次加载和条件变更后的请求放进 effect，保持页面数据自动同步。
  useEffect(() => {
    // 用 0ms timeout 把请求放到当前调用栈之后，避免 effect 内直接触发异步警告噪声。
    const timeoutId = window.setTimeout(() => {
      void loadGames();
    }, 0);

    return () => {
      // 组件卸载或依赖变化时清理定时器，避免过期请求回调继续执行。
      window.clearTimeout(timeoutId);
    };
  }, [loadGames]);

  // 分类选项单独加载，避免每次列表翻页都重复请求导航树。
  useEffect(() => {
    // 与列表加载保持相同的调度方式，减少两个 effect 的行为差异。
    const timeoutId = window.setTimeout(() => {
      void loadCategoryOptions();
    }, 0);

    return () => {
      // 这里同样要清理定时器，避免组件切走后继续写入状态。
      window.clearTimeout(timeoutId);
    };
  }, [loadCategoryOptions]);

  /**
   * 弹窗保存逻辑同时兼容新增与编辑，通过 selectedGame 是否存在来分流。
   * 页面本身不做字段级校验，表单组件和服务端负责约束输入合法性。
   */
  const handleSaveGame = async (
    input: SaveAdminGameInput | UpdateAdminGameInput,
  ) => {
    await executeAdminRequest({
      // 提交前先锁定按钮并清空旧错误，避免重复点击和误导性提示。
      onStart: () => {
        setIsSubmitting(true);
        setSubmitError("");
      },
      request: () => {
        // 编辑场景携带现有 id，新建场景直接创建新记录。
        if (selectedGame) {
          return updateAdminGame(session.accessToken, selectedGame.id, input);
        }

        return createAdminGame(session.accessToken, input as SaveAdminGameInput);
      },
      fallbackMessage: "保存游戏失败",
      onSuccess: async () => {
        // 保存成功后直接刷新列表，让表格与服务端状态保持一致。
        await loadGames();
        // 只有请求成功时才关闭弹窗，失败时保留用户输入和错误提示。
        setSelectedGame(null);
        setIsCreating(false);
      },
      onError: (message) => setSubmitError(message),
      // 保存失败同样要优先判断鉴权问题，避免界面停留在失效会话中。
      onAuthError: logout,
      // finally 中解锁按钮，确保异常路径也能再次提交。
      onFinally: () => setIsSubmitting(false),
    });
  };

  /**
   * 删除操作需要确认，并在删除当前页最后一条时自动回退页码。
   * 这样可以避免删除后落在空页，减少一次手动翻页操作。
   */
  const handleDeleteGame = (gameId: number) => {
    // 浏览器原生 confirm 足以覆盖后台删除确认场景。
    const confirmed = window.confirm("删除后不可恢复，确认删除该游戏吗？");

    if (!confirmed) {
      return;
    }

    // 事件处理器内部用自执行异步函数，避免把 onClick 改成 async 后遗漏错误处理。
    void (async () => {
      await executeAdminRequest({
        request: () => deleteAdminGame(session.accessToken, gameId),
        fallbackMessage: "删除游戏失败",
        onSuccess: async () => {
          // 当前页只剩一条且不是第一页时，先退回上一页再由 effect 触发重载。
          if (games.length === 1 && page > 1) {
            setPage((current) => current - 1);
            return;
          }

          // 其余情况直接原地刷新列表，维持当前分页位置。
          await loadGames();
        },
        // 删除失败沿用页面错误区域，让用户在列表上方直接看到反馈。
        onError: (message) => setLoadError(message),
        onAuthError: logout,
      });
    })();
  };

  // 打开新增弹窗时清空编辑对象，确保表单以空白初始值渲染。
  const openCreateModal = () => {
    // 新增入口不应继承上一次编辑失败留下的错误提示。
    setSubmitError("");
    setSelectedGame(null);
    setIsCreating(true);
  };

  // 编辑模式下保留当前游戏对象，供弹窗回填字段。
  const openEditModal = (game: AdminGame) => {
    // 切换编辑对象前先清掉旧错误，避免错误信息与当前记录不一致。
    setSubmitError("");
    setSelectedGame(game);
    setIsCreating(false);
  };

  // 关闭弹窗时统一回收状态，避免上一次操作的错误信息泄漏到下一次。
  const closeModal = () => {
    // 关闭时同时重置新增和编辑态，让下一次打开逻辑重新决定模式。
    setSubmitError("");
    setSelectedGame(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <CardShell
        title="游戏管理"
        description="基于服务端 Swagger 接口管理游戏列表，支持搜索、分页、新增、编辑与删除。"
      >
        {/* 顶部工具栏承载搜索、创建入口和总量统计。 */}
        {/* 布局在桌面端横向展开，在移动端则自动堆叠。 */}
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3 md:max-w-2xl md:flex-row">
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
              placeholder="搜索游戏名称或简介"
              value={keyword}
              onChange={(event) => {
                // 搜索词变化后回到第一页，避免继续停留在旧页码导致空结果。
                setKeyword(event.target.value);
                setPage(1);
              }}
            />
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {/* 创建入口固定放在搜索框旁边，减少管理操作路径。 */}
              新增游戏
            </button>
          </div>
          {/* 总量统计使用服务端 total，避免只统计当前页结果。 */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            共{" "}
            <span className="font-semibold text-slate-900">
              {pagination.total}
            </span>{" "}
            款游戏
          </div>
        </div>

        {/* 页面级错误放在表格上方，便于覆盖列表和分类读取失败两类情况。 */}
        {loadError ? (
          // 统一错误容器避免表格结构被错误提示打断。
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {loadError}
          </div>
        ) : null}

        <TableShell>
          {/* 表格容器只负责滚动与边框外观，业务判断仍留在页面层。 */}
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              {/* 表头顺序与游戏实体的核心管理字段保持一致。 */}
              <tr>
                <th className="px-4 py-3 font-medium">游戏</th>
                <th className="px-4 py-3 font-medium">分类</th>
                <th className="px-4 py-3 font-medium">开奖间隔</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">简介</th>
                <th className="px-4 py-3 font-medium">图标</th>
                <th className="px-4 py-3 font-medium">创建时间</th>
                <th className="px-4 py-3 font-medium">更新时间</th>
                {/* 操作列统一放在末尾，符合后台表格的通用阅读习惯。 */}
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {/* 加载态优先展示，避免旧数据在请求期间继续停留。 */}
              {isLoading ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={9}
                  >
                    {/* 加载提示占满全部列，避免列宽跳动。 */}
                    正在读取游戏列表...
                  </td>
                </tr>
              ) : null}
              {/* 非加载且无数据时再显示空态，避免与加载提示同时出现。 */}
              {!isLoading && games.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={9}
                  >
                    {/* 空态只在请求完成后出现，语义上与加载态清晰分离。 */}
                    当前筛选条件下暂无游戏。
                  </td>
                </tr>
              ) : null}
              {/* 数据行渲染聚焦于展示与操作，不在这里再做额外数据变换。 */}
              {games.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-100 text-slate-700"
                >
                  {/* 第一列展示名称和内部 id，兼顾辨识与排查。 */}
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        ID: {item.id}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {/* 分类名优先走映射表；缺失时回退到导航编号，避免空白。 */}
                    {categoryNameMap.get(item.category) ?? `导航 #${item.category}`}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {item.drawInterval} 秒
                  </td>
                  <td className="px-4 py-4">
                    {/* 状态颜色只区分运营中与其他状态，保持列表视觉简单。 */}
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                        item.status === GameResponseDtoStatusEnum.Online
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-slate-100 text-slate-600 ring-slate-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {/* 简介在进入表格前先截断，保证每行高度基本可控。 */}
                    {getGamePreviewText(item)}
                  </td>
                  <td className="px-4 py-4">
                    {/* 图标单独提供外链，避免在表格里直接渲染图片造成抖动。 */}
                    {item.iconUrl ? (
                      <a
                        href={item.iconUrl}
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
                  {/* 时间列统一走格式化工具，保证后台展示口径一致。 */}
                  <td className="px-4 py-4">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-4">{formatDate(item.updatedAt)}</td>
                  <td className="px-4 py-4">
                    {/* 行内操作只保留编辑和删除，避免表格区域承担过多分支。 */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 transition hover:border-slate-300"
                      >
                        {/* 编辑先打开弹窗，不在列表行内直接展开表单。 */}
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGame(item.id)}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-rose-600 transition hover:border-rose-300"
                      >
                        {/* 删除使用强调色，帮助用户区分危险操作。 */}
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>

        {/* 只有存在数据时才显示分页器，避免空态下出现无意义的翻页控件。 */}
        {games.length > 0 ? (
          // 分页器只依赖服务端回传的当前页和总页数。
          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            // 页码变化后只更新状态，具体请求由 effect 接管。
            onPageChange={(nextPage: number) => setPage(nextPage)}
          />
        ) : null}
      </CardShell>

      {/* 新增或编辑任一状态成立时渲染弹窗，表单逻辑统一复用同一个组件。 */}
      {/* 弹窗组件只接收当前模式所需的最小状态，不把列表逻辑继续下沉。 */}
      {selectedGame || isCreating ? (
        // selectedGame 为 null 时，弹窗内部即可判断为创建模式。
        <GameEditModal
          game={selectedGame}
          categoryOptions={categoryOptions}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onClose={closeModal}
          onSubmit={handleSaveGame}
        />
      ) : null}
    </div>
  );
}
