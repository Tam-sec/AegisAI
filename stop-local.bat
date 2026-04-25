@echo off
echo ===========================================
echo   AI Recruitment ^& HR Dashboard
echo   STOP LOCAL SERVICES
echo ===========================================
echo.

REM Kill backend processes
echo [*] Stopping Backend (uvicorn)...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq HR Dashboard Backend*" >nul 2>&1
taskkill /F /IM uvicorn.exe >nul 2>&1

REM Kill frontend processes
echo [*] Stopping Frontend (Node.js)...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq HR Dashboard Frontend*" >nul 2>&1

REM Kill Ollama if it was started by us (optional - comment out if you want Ollama to keep running)
REM echo [*] Stopping Ollama...
REM taskkill /F /IM ollama.exe >nul 2>&1

echo [OK] All local services stopped.
echo.
pause
