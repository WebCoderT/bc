# 游戏运营管理后台

基于 `Next.js 16`、`React 19` 和 App Router 搭建的管理后台示例，包含：

- 登录页
- Dashboard
- 用户管理
- 导航管理
- 游戏管理

## 技术方案

- 使用 Next App Router 的文件路径直接映射后台路由。
- 使用 `app/(admin)/layout.tsx` 共享后台布局，不额外增加 URL 路径层级。
- 使用 Swagger 自动生成前端请求代码，并在 `app/lib/admin-api.ts` 中统一封装登录、鉴权、用户管理、游戏管理与导航管理请求。
- 使用 `localStorage` 存储管理员会话与 JWT，并通过路由守卫限制未登录访问。
- 本地开发默认使用 Next 同源代理 `/api` 转发到后端，避免浏览器跨域问题。
- 可通过 `ADMIN_API_PROXY_TARGET` 配置本地代理目标，默认指向 `http://localhost:8000`。
- 可通过 `NEXT_PUBLIC_API_BASE_URL` 手动覆盖前端请求基址；不覆盖时默认走同源 `/api`。

## 本地运行

```bash
npm install
npm run generate:api
npm run dev
```

打开 `http://localhost:8002`。

## 演示账号

- `admin_root / Admin@123`

## 构建验证

```bash
npm run build
```

## 已对接接口

- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api`
- `GET /api/public/announcements`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`

## Swagger 文档

- `http://localhost:8000/docs/admin`

Swagger 生成 JSON 默认读取：

- `http://localhost:8000/docs/admin-json`

如需重新生成前端请求代码：

```bash
npm run generate:api
```

如需覆盖 Swagger 地址：

```bash
ADMIN_SWAGGER_URL=http://127.0.0.1:8000/docs/admin-json npm run generate:api
```

## 环境变量

本地开发推荐使用：

```bash
ADMIN_API_PROXY_TARGET=http://localhost:8000
```

如需手动覆盖前端请求基址：

```bash
NEXT_PUBLIC_API_BASE_URL=/api
```

这样浏览器请求会先打到 `http://localhost:8002/api/*`，再由 Next 转发到本地后端，避免 CORS。

## 目录说明

- `app/(admin)/**/page.tsx`：后台页面入口，按 Next App Router 目录约定放置，不再把页面实现散落到 `components`。
- `app/components/**`：跨页面复用的公共组件、后台壳组件、弹窗、表格与基础 UI。
- `app/layout.tsx`：应用根布局与站点元信息
- `app/page.tsx`：根路径登录态判断与跳转
- `app/login/page.tsx`：登录页路由
- `app/(admin)/*/page.tsx`：后台业务页面路由
- `app/(admin)/layout.tsx`：后台共享布局入口
- `app/components/admin/*`：后台共享组件、会话守卫与布局壳子
- `app/components/admin/ui/*`：后台复用 UI 组件
- `app/data/*`：静态展示数据与配置常量
- `app/routes/*`：后台导航路由配置
- `app/utils/*`：格式化与状态样式等公共方法
- `app/types/*`：后台 UI 相关类型定义
- `app/generated/admin-api/*`：Swagger 自动生成的请求客户端与类型
- `app/lib/admin-api.ts`：对生成客户端的二次封装、JWT 会话读写与统一错误处理
- `app/globals.css`：全局样式与滚动条优化

## 后续扩展建议

- 对接真实登录接口与 Token 刷新逻辑
- 将 mock 数据拆分为 API 层与业务组件
- 增加表单弹窗、分页、权限按钮与图表组件
