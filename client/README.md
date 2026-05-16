## 项目简介

这是一个基于 [Next.js](https://nextjs.org) App Router 的运动科技风前端项目，包含两个核心区域：

- 未登录状态的官网首页
- `/game` 已登录后的工作台

## Getting Started

先启动开发服务：

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看页面。

## 目录结构

```text
app/
	components/              # 全局公共组件
	generated/api/           # Swagger 生成请求代码
	game/                    # 已登录工作台路由
		page.tsx               # `/game`
		layout.tsx             # `/game` 共享布局
		account-security/
		assets/
		esports/
		sports/
		support/
		wallet-records/
	lib/                     # 全局工具与会话逻辑
```

## 架构说明

- 使用 Next.js App Router 管理全部页面与嵌套路由。
- `/game` 下每个页面都使用真实目录和 `page.tsx` 文件承载。
- 登录态通过 Swagger 生成接口与 `localStorage` 会话配合完成。
- 公共组件与路由私有组件按作用域拆分，避免额外命名层级。

## 常用命令

```bash
npm run dev
npm run lint
npm run build
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
