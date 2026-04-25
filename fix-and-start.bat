@echo off
REM Quick fix script for common startup issues
echo ===========================================
echo   AI HR Dashboard - Quick Fix
echo ===========================================
echo.

REM Kill any existing uvicorn processes
echo [*] Stopping any running backend processes...
taskkill //F //IM uvicorn.exe 2>nul
taskkill //F //IM python.exe //FI "WINDOWTITLE eq HR Dashboard Backend*" 2>nul

REM Navigate to backend
cd backend

REM Check if venv exists, create if not
if not exist "venv\Scripts\activate.bat" (
    echo [*] Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created.
)

REM Activate venv and update dependencies
echo [*] Updating Python dependencies...
call venv\Scripts\activate.bat
pip install --upgrade -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to update dependencies.
    pause
    exit /b 1
)

echo [OK] Dependencies updated.
cd ..

echo.
echo [DONE] You can now run: python start-local.py
echo.
pause
