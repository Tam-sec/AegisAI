@echo off
title AI HR Recruitment Dashboard
color 0A

echo ========================================
echo   AI HR Recruitment Dashboard Launcher
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Ollama...
ollama list >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Ollama is not running. Starting Ollama...
    start "" ollama
    timeout /t 3 /nobreak >nul
)
echo [OK] Ollama is running
echo.

echo [2/3] Starting Backend Server (port 8001)...
cd /d "%~dp0backend"
start "HR Backend" cmd /c "python main.py"
echo [OK] Backend starting...
timeout /t 3 /nobreak >nul
echo.

echo [3/3] Starting Frontend Server (port 3000)...
cd /d "%~dp0frontend"
start "HR Frontend" cmd /c "npm run dev"
echo [OK] Frontend starting...
timeout /t 5 /nobreak >nul
echo.

echo ========================================
echo   All servers starting...
echo ========================================
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8001
echo   API:      http://localhost:8001/api
echo.
echo   Login: username=tamer, password=tamer
echo.
echo   Press any key to open the app...
pause >nul

start http://localhost:3000

echo.
echo [DONE] App is running!
echo Close this window to stop all servers.
pause
