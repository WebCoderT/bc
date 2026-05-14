# 概率学应用服务端

基于 NestJS 的示例服务端，已补齐以下基础能力：

- 普通用户注册
- JWT 登录与鉴权
- MySQL + TypeORM 数据持久化
- 普通用户 / VIP 用户 / 后台管理员 三种角色权限
- 按功能目录做文件物理隔离
- 三套不同地址的 Swagger 文档

## 目录结构

```text
src/
├─ admin/      # 管理员接口
├─ auth/       # 注册、登录、JWT 资料接口
├─ common/     # 角色装饰器、守卫、枚举
├─ member/     # 登录用户接口
├─ public/     # 公开接口
├─ swagger/    # Swagger 文档配置
├─ users/      # 用户服务与用户实体
└─ vip/        # VIP 专属接口
```

## 已实现接口

### 公开接口

- `GET /api`
- `GET /api/public/announcements`

### 认证接口

- `POST /api/auth/register`：注册普通用户
- `POST /api/auth/login`：登录获取 `accessToken`
- `GET /api/auth/profile`：携带 JWT 后校验并返回当前用户信息

### 用户权限接口

- `GET /api/member/dashboard`：普通用户、VIP、管理员都可访问
- `GET /api/vip/insights`：仅 VIP、管理员可访问
- `GET /api/admin/users`：仅管理员可访问
- `PATCH /api/admin/users/:id/role`：仅管理员可修改用户角色

## 默认演示账号

系统内置三个演示账号，便于直接测试权限：

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 普通用户 | `normal_demo` | `User@123` |
| VIP 用户 | `vip_demo` | `Vip@123` |
| 后台管理员 | `admin_root` | `Admin@123` |

新注册账号默认角色为 `user`。

## Swagger 文档地址

启动服务后可访问：

- `http://localhost:8000/docs/public`：公开接口 + 注册/登录
- `http://localhost:8000/docs/member`：认证接口 + 用户中心 + VIP 接口
- `http://localhost:8000/docs/admin`：认证接口 + 后台管理接口

三套 Swagger 会根据模块分组，展示不同内容。

## 运行方式

### 安装依赖

```bash
npm install
```

### 本地 MySQL 配置

当前默认连接本地 MySQL：

- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_USER=root`
- `DB_PASSWORD=123456`
- `DB_NAME=probability_app`

首次运行前，程序会连接到本地 MySQL；本次已按该配置创建数据库 `probability_app`。
数据库表结构现在通过 TypeORM migration 管理，不再依赖 `synchronize`。

### 启动开发环境

```bash
npm run migration:run
npm run start:dev
```

默认端口：`8000`

### JWT 密钥

可通过环境变量覆盖默认密钥：

```bash
JWT_SECRET=your-secret
```

数据库配置也支持通过环境变量覆盖：

```bash
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=probability_app
```

未设置时会使用内置开发密钥，仅适合本地示例环境。

## 请求示例

### 注册

```json
{
  "username": "case_user",
  "password": "Case@123"
}
```

### 登录

```json
{
  "username": "admin_root",
  "password": "Admin@123"
}
```

登录成功后，将返回：

```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": 3,
    "username": "admin_root",
    "role": "admin",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

后续请求请在请求头中带上：

```text
Authorization: Bearer <jwt>
```

## 测试与构建

```bash
npm test
npm run test:e2e
npm run build
```

## Migration 命令

```bash
npm run migration:show
npm run migration:run
npm run migration:revert
```

当前应用启动时也会自动执行未应用的 migration，保证本地开发环境可直接启动。

当前已验证：

- 注册普通用户
- 登录获取 JWT
- JWT 校验成功
- 普通用户无法访问 VIP 接口
- VIP 可访问专属接口
- 管理员可修改用户角色
