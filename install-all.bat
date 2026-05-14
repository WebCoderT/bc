@echo off
setlocal

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
set "DRY_RUN=%~1"

call :run_install "admin" "%ROOT_DIR%\admin"
if errorlevel 1 exit /b 1

call :run_install "client" "%ROOT_DIR%\client"
if errorlevel 1 exit /b 1

call :run_install "server" "%ROOT_DIR%\server"
if errorlevel 1 exit /b 1

echo.
echo [done] All dependencies installed successfully.
exit /b 0

:run_install
set "PROJECT_NAME=%~1"
set "PROJECT_DIR=%~2"
echo.
echo [install] %PROJECT_NAME%
if /I "%DRY_RUN%"=="--dry-run" (
  echo cd /d "%PROJECT_DIR%" ^&^& npm.cmd install
  exit /b 0
)
cd /d "%PROJECT_DIR%" && npm.cmd install
exit /b %errorlevel%
