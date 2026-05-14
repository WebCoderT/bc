ROOT := $(CURDIR)
ADMIN_DIR := $(ROOT)\admin
CLIENT_DIR := $(ROOT)\client
SERVER_DIR := $(ROOT)\server
NPM := npm.cmd

.PHONY: help install install-admin install-client install-server \
	dev-admin dev-client dev-server dev-all bootstrap

# 默认展示帮助信息，方便团队成员直接查看可用命令。
help:
	@cmd /c "echo."
	@cmd /c "echo Available targets:"
	@cmd /c "echo   make install         - 安装 admin、client、server 全部依赖"
	@cmd /c "echo   make install-admin   - 安装 admin 依赖"
	@cmd /c "echo   make install-client  - 安装 client 依赖"
	@cmd /c "echo   make install-server  - 安装 server 依赖"
	@cmd /c "echo   make dev-admin       - 启动 admin 开发服务"
	@cmd /c "echo   make dev-client      - 启动 client 开发服务"
	@cmd /c "echo   make dev-server      - 启动 server 开发服务"
	@cmd /c "echo   make dev-all         - 一次性启动三个项目"
	@cmd /c "echo   make bootstrap       - 安装全部依赖后再启动三个项目"
	@cmd /c "echo."
	@cmd /c "echo Notes:"
	@cmd /c "echo   1. 需要本机已安装 GNU Make 和 Node.js。"
	@cmd /c "echo   2. dev-all / bootstrap 会在新的命令行窗口中启动三个项目。"
	@cmd /c "echo."

# 安装全部依赖。
install: install-admin install-client install-server

# 安装 admin 依赖。
install-admin:
	@cmd /c "cd /d \"$(ADMIN_DIR)\" && $(NPM) install"

# 安装 client 依赖。
install-client:
	@cmd /c "cd /d \"$(CLIENT_DIR)\" && $(NPM) install"

# 安装 server 依赖。
install-server:
	@cmd /c "cd /d \"$(SERVER_DIR)\" && $(NPM) install"

# 在独立窗口启动 admin。
dev-admin:
	@cmd /c "start \"admin-dev\" cmd /k \"cd /d \"\"$(ADMIN_DIR)\"\" && $(NPM) run dev\""

# 在独立窗口启动 client。
dev-client:
	@cmd /c "start \"client-dev\" cmd /k \"cd /d \"\"$(CLIENT_DIR)\"\" && $(NPM) run dev\""

# 在独立窗口启动 server。
dev-server:
	@cmd /c "start \"server-dev\" cmd /k \"cd /d \"\"$(SERVER_DIR)\"\" && $(NPM) run start:dev\""

# 一次性启动三个项目。
dev-all: dev-admin dev-client dev-server

# 完整初始化：先安装依赖，再启动三个项目。
bootstrap: install dev-all
