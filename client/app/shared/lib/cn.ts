/**
 * 将多个 className 片段合并成一个字符串。
 *
 * 这个工具保持实现足够轻量，避免为简单的样式拼接
 * 引入额外依赖，同时也让共享组件的 API 更稳定。
 */
export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
