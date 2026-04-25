@echo off
setlocal enabledelayedexpansion

title AI Recruitment & HR Dashboard Launcher
echo ===========================================
echo   AI Recruitment ^& HR Dashboard Launcherecho ===========================================
echo.

REM --- Check if Docker is installed ---
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH.
    echo Please install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)
echo [OK] Docker found

REM --- Check if Docker is running ---
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Desktop is not running.
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)
echo [OK] Docker is running

REM --- Check if Ollama is installed ---
where ollama >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Ollama is not installed or not in PATH.
    echo Please install Ollama: https://ollama.com/download
    pause
    exit /b 1
)
echo [OK] Ollama found

REM --- Start Ollama if not running ---
tasklist | findstr /I "ollama.exe" >nul 2>&1
if errorlevel 1 (
    echo [*] Starting Ollama...
    start "" /MIN ollama
    timeout /t 5 /nobreak >nul
) else (
    echo [OK] Ollama is already running
)

REM --- Check Ollama API ---
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo [*] Waiting for Ollama API to be ready...
    timeout /t 5 /nobreak >nul
)

REM --- Check if Gemma 4 model is available ---
echo [*] Checking for Gemma 4 model...
curl -s http://localhost:11434/api/tags | findstr "gemma4" >nul 2>&1
if errorlevel 1 (
    echo [*] Gemma 4 model not found. Pulling gemma4:latest (this may take a while)...
    ollama pull gemma4:latest
    if errorlevel 1 (
        echo [ERROR] Failed to pull gemma4 model.
        pause
        exit /b 1
    )
) else (
    echo [OK] Gemma 4 model is available
)

REM --- Ensure .env file exists ---
if not exist ".env" (
    echo [*] Creating .env from .env.example...
    if not exist ".env.example" (
        echo [ERROR] .env.example not found.
        pause
        exit /b 1
    )
    copy /Y ".env.example" ".env" >nul
    echo [OK] Created .env file. Please review and customize it if needed.
)

REM --- Create data directories ---
if not exist "data\uploads" mkdir "data\uploads"

REM --- Start Docker Compose ---
echo [*] Starting Docker Compose services...
docker-compose down >nul 2>&1
docker-compose up --build -d
if errorlevel 1 (
    echo [ERROR] Docker Compose failed to start.
    echo Try running: docker-compose up --build
    pause
    exit /b 1
)

echo.
echo ===========================================
echo   All services are starting up!
echo ===========================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8001
echo API Docs:  http://localhost:8001/docs
echo.
echo Default login:
echo   Username: admin
echo   Password: admin123
echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM --- Wait for backend health check ---
set RETRIES=0
:CHECK_BACKEND
curl -s http://localhost:8001/api/health | findstr "healthy" >nul 2>&1
if errorlevel 1 (
    set /a RETRIES+=1
    if !RETRIES! geq 12 (
        echo [WARNING] Backend health check timed out.
        echo Services may still be starting. Please wait and refresh.
        goto :OPEN_BROWSER
    )
    echo [*] Waiting for backend... (attempt !RETRIES!/12)
    timeout /t 5 /nobreak >nul
    goto :CHECK_BACKEND
)
echo [OK] Backend is healthy

:OPEN_BROWSER
echo [*] Opening browser...
start http://localhost:3000

echo.
echo ===========================================
echo   Dashboard is ready!
echo ===========================================
echo.
echo To stop the app, run: docker-compose down
echo Or close this window and run stop.bat
echo.
echo Press any key to open logs (or close this window to keep running in background)...
pause >nul
cls
docker-compose logs -f

endlocal
