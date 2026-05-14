@echo off
setlocal

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
set "DRY_RUN=%~1"

echo [bootstrap] Installing dependencies...
call "%ROOT_DIR%\install-all.bat" %DRY_RUN%
if errorlevel 1 exit /b 1

echo.
echo [bootstrap] Starting all projects...
call "%ROOT_DIR%\start-all.bat" %DRY_RUN%
if errorlevel 1 exit /b 1

exit /b 0
