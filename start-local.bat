@echo off
setlocal enabledelayedexpansion

title AI Recruitment and HR Dashboard - Local Mode
echo ===========================================
echo   AI Recruitment and HR Dashboard
echo   LOCAL MODE (No Docker)
echo ===========================================
echo.

REM --- Configuration ---
set "BACKEND_PORT=8001"
set "FRONTEND_PORT=3000"

REM --- Check Python ---
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.11+: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python found

REM --- Check Node.js ---
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js 20+: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found

REM --- Check Ollama ---
where ollama >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Ollama is not installed or not in PATH.
    echo Please install Ollama: https://ollama.com/download
    pause
    exit /b 1
)
echo [OK] Ollama found

REM --- Start Ollama if not running ---
tasklist /FI "IMAGENAME eq ollama.exe" 2>nul | find /I "ollama.exe" >nul
if errorlevel 1 (
    echo [STARTING] Ollama...
    start "" /MIN ollama serve
    timeout /t 8 /nobreak >nul
) else (
    echo [OK] Ollama is already running
)

REM --- Check if Gemma 4 model is available ---
echo [CHECKING] For Gemma 4 model...
ollama list 2>nul | find /I "gemma4" >nul
if errorlevel 1 (
    echo [PULLING] Gemma 4 model. This may take several minutes...
    ollama pull gemma4:latest
    if errorlevel 1 (
        echo [ERROR] Failed to pull gemma4:latest model.
        pause
        exit /b 1
    )
) else (
    echo [OK] Gemma 4 model is available
)

REM --- Setup environment ---
if not exist ".env" (
    echo [CREATING] .env from .env.example...
    if not exist ".env.example" (
        echo [ERROR] .env.example not found.
        pause
        exit /b 1
    )
    copy /Y ".env.example" ".env" >nul
    echo [OK] Created .env file. Please review and customize it if needed.
)

REM --- Create data directories ---
if not exist "data" mkdir "data"
if not exist "data\uploads" mkdir "data\uploads"

REM --- Start Backend ---
echo.
echo [SETTING UP] Backend...
cd backend

REM Create venv if not exists
if not exist "venv" (
    echo [CREATING] Python virtual environment...
    python -m venv venv
)

REM Activate venv
call venv\Scripts\activate.bat

REM Install dependencies
echo [INSTALLING] Python dependencies... This may take a few minutes.
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install Python dependencies.
    pause
    exit /b 1
)

REM Run database migrations
echo [RUNNING] Database migrations...
python -c "from core.database import Base, engine; Base.metadata.create_all(bind=engine)" 2>nul
if errorlevel 1 (
    echo [INFO] Migration step completed.
)

echo [STARTING] Backend API on port %BACKEND_PORT%...
start "HR Dashboard Backend" cmd /c "call venv\Scripts\activate.bat && uvicorn main:app --reload --port %BACKEND_PORT% --host 0.0.0.0"

cd ..

REM --- Wait for backend to start ---
echo [WAITING] For backend to initialize...
timeout /t 8 /nobreak >nul

REM --- Check backend health ---
set "RETRIES=0"
:CHECK_BACKEND
curl -s http://localhost:%BACKEND_PORT%/api/health > .tmp_health.txt 2>nul
type .tmp_health.txt | find /I "healthy" >nul
if errorlevel 1 (
    set /a RETRIES+=1
    if !RETRIES! geq 15 (
        echo [WARNING] Backend health check timed out. It may still be starting...
        if exist ".tmp_health.txt" del ".tmp_health.txt"
        goto :START_FRONTEND
    )
    echo [WAITING] For backend... (attempt !RETRIES!/15)
    timeout /t 3 /nobreak >nul
    if exist ".tmp_health.txt" del ".tmp_health.txt"
    goto :CHECK_BACKEND
)
if exist ".tmp_health.txt" del ".tmp_health.txt"
echo [OK] Backend is healthy

:START_FRONTEND
REM --- Start Frontend ---
echo.
echo [SETTING UP] Frontend...
cd frontend

REM Install dependencies
echo [INSTALLING] Node.js dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)

echo [STARTING] Frontend on port %FRONTEND_PORT%...
start "HR Dashboard Frontend" cmd /c "npm run dev"

cd ..

REM --- Wait for frontend ---
timeout /t 5 /nobreak >nul

echo.
echo ===========================================
echo   ALL SERVICES ARE STARTING UP
echo ===========================================
echo.
echo Frontend:  http://localhost:%FRONTEND_PORT%
echo Backend:   http://localhost:%BACKEND_PORT%
echo API Docs:  http://localhost:%BACKEND_PORT%/docs
echo.
echo Default login:
echo   Username: admin
echo   Password: admin123
echo.
echo NOTE: Using SQLite database (data/hr_app.db)
echo.
pause

echo [OPENING] Dashboard in your browser...
start http://localhost:%FRONTEND_PORT%

echo.
echo Services are running in separate windows.
echo Close those windows to stop the services.
echo.
pause

endlocal
