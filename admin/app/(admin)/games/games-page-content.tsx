import { GameEditModal } from "@/app/components/admin/game-edit-modal";
import { GameDrawRecordsModal } from "@/app/components/admin/game-draw-records-modal";
import { CardShell } from "@/app/components/admin/ui/card-shell";
import { PaginationControls } from "@/app/components/admin/ui/pagination-controls";
import { GamesErrorBanner, GamesTable, GamesToolbar } from "./page-components";
import type { GamesPageState } from "./use-games-page";

export function GamesPageContent({
  keyword,
  games,
  categoryOptions,
  gameModelOptions,
  isLoading,
  loadError,
  selectedGame,
  isCreating,
  isSubmitting,
  submitError,
  pagination,
  drawHistoryGame,
  isDrawing,
  drawError,
  categoryNameMap,
  gameModelNameMap,
  setPage,
  handleKeywordChange,
  handleSaveGame,
  handleDeleteGame,
  handleDrawOnce,
  openCreateModal,
  openEditModal,
  openDrawHistoryModal,
  closeModal,
  closeDrawHistoryModal,
}: GamesPageState) {
  return (
    <div className="space-y-6">
      <CardShell
        title="游戏管理"
        description="基于服务端 Swagger 接口管理游戏列表，支持搜索、分页、新增、编辑与删除。"
      >
        <GamesToolbar
          keyword={keyword}
          total={pagination.total}
          onCreate={openCreateModal}
          onKeywordChange={handleKeywordChange}
        />

        <GamesErrorBanner message={loadError} />

        <GamesTable
          games={games}
          isLoading={isLoading}
          categoryNameMap={categoryNameMap}
          gameModelNameMap={gameModelNameMap}
          onEdit={openEditModal}
          onViewDraws={openDrawHistoryModal}
          onDrawOnce={handleDrawOnce}
          onDelete={handleDeleteGame}
        />

        {games.length > 0 ? (
          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </CardShell>

      {selectedGame || isCreating ? (
        <GameEditModal
          key={selectedGame ? `edit-${selectedGame.id}` : "create-game"}
          game={selectedGame}
          categoryOptions={categoryOptions}
          gameModelOptions={gameModelOptions}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onClose={closeModal}
          onSubmit={handleSaveGame}
        />
      ) : null}

      {drawHistoryGame ? (
        <GameDrawRecordsModal
          game={drawHistoryGame}
          isDrawing={isDrawing}
          error={drawError}
          onClose={closeDrawHistoryModal}
          onDrawOnce={() => handleDrawOnce(drawHistoryGame)}
        />
      ) : null}
    </div>
  );
}
