export function getDrawTableName(gameId: number) {
  if (!Number.isInteger(gameId) || gameId < 1) {
    throw new Error('无效的游戏ID，无法生成开奖表名');
  }

  return `game_draw_${gameId}`;
}
