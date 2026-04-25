@echo off
setlocal enabledelayedexpansion

title Tamer - AI HR Dashboard Launcher
color 0A

cls
echo ===========================================
echo   AI HR Recruitment Dashboard
echo   Quick Launcher - By Tamer
echo ===========================================
echo.

REM --- Config ---
set "BACKEND_PORT=8001"
set "FRONTEND_PORT=3000"
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM --- Check Prerequisites ---
echo [1/6] Checking prerequisites...

python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install Python 3.11+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install Node.js 20+ from https://nodejs.org/
    pause
    exit /b 1
)

where ollama >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Ollama not found. Install from https://ollama.com/download
    pause
    exit /b 1
)
echo [OK] All prerequisites found.
echo.

REM --- Start Ollama ---
echo [2/6] Checking Ollama...
tasklist /FI "IMAGENAME eq ollama.exe" 2>nul | find /I "ollama.exe" >nul
if errorlevel 1 (
    echo [STARTING] Ollama...
    start "" /MIN ollama serve
    timeout /t 8 /nobreak >nul
) else (
    echo [OK] Ollama is already running.
)

REM --- Pull Gemma4 if missing ---
echo [CHECKING] For gemma4 model...
ollama list 2>nul | find /I "gemma4" >nul
if errorlevel 1 (
    echo [PULLING] gemma4 model (this may take a while)...
    ollama pull gemma4:latest
    if errorlevel 1 (
        echo [ERROR] Failed to pull gemma4 model.
        pause
        exit /b 1
    )
) else (
    echo [OK] gemma4 model is available.
)
echo.

REM --- Setup Environment ---
echo [3/6] Setting up environment...
if not exist "data" mkdir "data"
if not exist "data\uploads" mkdir "data\uploads"

if not exist ".env" (
    if exist ".env.example" (
        copy /Y ".env.example" ".env" >nul
        echo [INFO] Created .env from .env.example
    )
)
echo [OK] Environment ready.
echo.

REM --- Start Backend ---
echo [4/6] Starting Backend on port %BACKEND_PORT%...
cd backend

if not exist "venv" (
    echo [CREATING] Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat >nul

echo [INSTALLING] Python dependencies...
pip install -q -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies.
    pause
    exit /b 1
)

echo [STARTING] Backend server...
start "" /MIN cmd /c "cd /d %SCRIPT_DIR%backend && call venv\Scripts\activate.bat && uvicorn main:app --reload --port %BACKEND_PORT% --host 0.0.0.0"

cd /d "%SCRIPT_DIR%"

REM --- Wait for Backend ---
echo [WAITING] For backend to be ready...
timeout /t 5 /nobreak >nul
set "RETRIES=0"
:CHECK_BACKEND
curl -s http://localhost:%BACKEND_PORT%/api/health > .tmp_health.txt 2>nul
type .tmp_health.txt | find /I "healthy" >nul
if errorlevel 1 (
    set /a RETRIES+=1
    if !RETRIES! geq 20 (
        echo [WARNING] Backend health check timed out. It may still be starting...
        goto :START_FRONTEND
    )
    echo [WAITING] Backend... (attempt !RETRIES!/20)
    timeout /t 3 /nobreak >nul
    goto :CHECK_BACKEND
)
if exist ".tmp_health.txt" del ".tmp_health.txt"
echo [OK] Backend is healthy.
echo.

:START_FRONTEND
REM --- Start Frontend ---
echo [5/6] Starting Frontend on port %FRONTEND_PORT%...
cd frontend

echo [INSTALLING] Node.js dependencies...
call npm install >nul 2>&1

echo [STARTING] Frontend dev server...
start "" /MIN cmd /c "cd /d %SCRIPT_DIR%frontend && npm run dev"

cd /d "%SCRIPT_DIR%"
timeout /t 5 /nobreak >nul
echo [OK] Frontend starting...
echo.

REM --- Done ---
echo ===========================================
echo   ALL SERVICES ARE RUNNING
echo ===========================================
echo.
echo   Frontend:  http://localhost:%FRONTEND_PORT%
echo   Backend:   http://localhost:%BACKEND_PORT%
echo   API Docs:  http://localhost:%BACKEND_PORT%/docs
echo.
echo   Login:     tamer / tamer
echo.

pause

start http://localhost:%FRONTEND_PORT%

echo.
echo [DONE] App is running! Close this window to stop the launcher.
echo.
pause

endlocal
