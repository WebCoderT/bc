# 概率学应用 Workspace

这个工作区包含 3 个独立的 Node.js 项目：

- `admin`：管理端前端
- `client`：用户端前端
- `server`：NestJS 服务端

## 一键脚本

### Windows 批处理

适合没有安装 `make` 的 Windows 环境：

```bat
install-all.bat
start-all.bat
bootstrap-all.bat
```

- `install-all.bat`：安装 3 个项目的依赖
- `start-all.bat`：分别在 3 个新窗口启动项目
- `bootstrap-all.bat`：先安装依赖，再启动全部项目

支持干跑预览：

```bat
install-all.bat --dry-run
start-all.bat --dry-run
bootstrap-all.bat --dry-run
```

### Makefile

如果本机已安装 `GNU Make`，也可以使用：

```bash
make install
make dev-all
make bootstrap
```

## 前置要求

- 已安装 Node.js
- Windows 下如果要使用 `make`，需要额外安装 GNU Make

## 说明

- `admin` 和 `client` 使用 `npm run dev`
- `server` 使用 `npm run start:dev`
- 一键启动脚本会分别打开 3 个新的命令行窗口，互不影响
