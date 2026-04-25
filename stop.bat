@echo off
echo ===========================================
echo   AI Recruitment ^& HR Dashboard - Stop
echo ===========================================
echo.
echo [*] Stopping Docker services...
docker-compose down
if errorlevel 1 (
    echo [ERROR] Failed to stop services.
    pause
    exit /b 1
)
echo [OK] All services stopped.
echo.
pause
