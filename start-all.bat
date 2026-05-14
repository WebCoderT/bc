@echo off
setlocal

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
set "DRY_RUN=%~1"

call :run_start "admin-dev" "%ROOT_DIR%\admin" "npm.cmd run dev"
if errorlevel 1 exit /b 1

call :run_start "client-dev" "%ROOT_DIR%\client" "npm.cmd run dev"
if errorlevel 1 exit /b 1

call :run_start "server-dev" "%ROOT_DIR%\server" "npm.cmd run start:dev"
if errorlevel 1 exit /b 1

echo.
echo [done] All projects have been started in separate windows.
exit /b 0

:run_start
set "WINDOW_TITLE=%~1"
set "PROJECT_DIR=%~2"
set "START_COMMAND=%~3"
echo.
echo [start] %WINDOW_TITLE%
if /I "%DRY_RUN%"=="--dry-run" (
  echo start "%WINDOW_TITLE%" cmd /k "pushd %PROJECT_DIR% ^&^& %START_COMMAND%"
  exit /b 0
)
start "%WINDOW_TITLE%" cmd /k "pushd %PROJECT_DIR% && %START_COMMAND%"
exit /b 0
