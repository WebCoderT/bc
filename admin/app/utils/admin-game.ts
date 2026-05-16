import {
    GameResponseDtoStatusEnum,
    type AdminGame,
    type AdminNavigation,
} from "@/app/lib/admin-api";
// 游戏列表页面相关的工具函数和常量。
export const GAME_PAGE_SIZE = 8;
// 游戏列表表格一共 9 列，其中操作列固定宽度 120px，其他列等分剩余空间。
export const GAME_TABLE_COLUMN_COUNT = 9;
// 游戏分类选项来源于导航接口，且仅限于一级分类，因此需要把嵌套的导航数据扁平化成列表供表单选择。
export function flattenGameCategoryOptions(items: AdminNavigation[]) {
    return items.flatMap((item) => [item, ...item.children]);
}
// 游戏描述可能过长，列表中只展示前 60 字并加省略号提示。
export function getGamePreviewText(game: AdminGame) {
    return game.description.length > 60
        ? `${game.description.slice(0, 60)}...`
        : game.description;
}
// 根据游戏状态返回对应的样式类名，用于列表中状态标签的视觉区分。
export function getGameStatusClassName(status: AdminGame["status"]) {
    const statusClassMap: Record<GameResponseDtoStatusEnum, string> = {
        [GameResponseDtoStatusEnum.Online]: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        [GameResponseDtoStatusEnum.Offline]: "bg-slate-100 text-slate-600 ring-slate-200",
    };
    return statusClassMap[status] || "bg-gray-100 text-gray-600 ring-gray-200";
}

// 根据游戏状态返回对应的文本描述，用于列表中状态标签的文字显示。
export function getGameStatusText(status: AdminGame["status"]) {
    const statusTextMap: Record<GameResponseDtoStatusEnum, string> = {
        [GameResponseDtoStatusEnum.Online]: "在线",
        [GameResponseDtoStatusEnum.Offline]: "离线",
    };
    return statusTextMap[status] || "未知";
}
