export enum GameModelStatus {
  // 模型处于活跃状态，可以被正常使用和访问
  ACTIVE = 'active',
  // 模型处于非活跃状态，暂时不可用，但保留在系统中
  INACTIVE = 'inactive',
  // 模型已废弃，不再推荐使用，可能会在未来被删除
  DEPRECATED = 'deprecated',
  // 模型已删除，不再存在于系统中，无法访问
  DELETED = 'deleted',
}
