## 项目简介

这是一个基于 [Next.js](https://nextjs.org) 的运动科技风前端演示项目，包含两个核心区域：

- 未登录状态的官网首页
- `/game` 已登录后的后台工作台

项目同时实现了主题切换、本地登录态、顶部导航、动态二级侧栏，以及后台内部路由。

## Getting Started

先启动开发服务：

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看页面。

## 目录结构

项目按照“共享层 + 业务层”进行整理，更符合常见开源项目的维护方式：

```text
app/
	components/              # 跨页面公共组件
	game/                    # 已登录后台业务模块
		components/            # game 专属展示组件
		hooks/                 # game 专属逻辑 hook
		routes.ts              # 一级/二级导航配置
	lib/                     # 全局工具方法
	shared/                  # 通用 UI、常量、轻量工具
		components/ui/         # Button / Card / Heading 等基础组件
		constants/             # 首页营销文案与静态配置
		lib/                   # 通用工具函数
	theme/                   # 全局主题配置与 provider
```

## 架构说明

- 使用 Next.js App Router 管理外层页面结构。
- 使用 `react-router-dom` 管理 `/game` 内部子页面与权限守卫。
- 使用 `localStorage` 模拟登录态和主题状态。
- 使用共享组件减少重复 UI，实现更稳定的设计规范。
- 使用配置驱动生成导航和占位页面，便于后续继续扩展。

## 常用命令

```bash
npm run dev
npm run lint
npm run build
```

## 重构原则

这次整理遵循以下约定：

- 公共方法与业务逻辑分离
- 公共组件与业务组件分层
- 路由和导航配置集中管理
- 页面组件尽量只负责组合与展示
- 为关键模块补充注释，降低后续接手成本

## 后续扩展建议

- 接入真实登录注册接口
- 为充值 / 提现入口接入真实业务流程
- 为各二级导航页面补充正式内容
- 增加测试、组件文档和接口层抽象

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Router Documentation](https://reactrouter.com/)
