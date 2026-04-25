@echo off
title Stop AI HR Recruitment Dashboard

echo ========================================
echo   Stopping AI HR Dashboard Servers
echo ========================================
echo.

echo Stopping Frontend (Node.js)...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq HR Frontend*" >nul 2>&1
taskkill /F /FI "IMAGENAME eq node.exe" >nul 2>&1
echo [OK] Frontend stopped

echo.
echo Stopping Backend (Python)...
taskkill /F /FI "IMAGENAME eq python.exe" >nul 2>&1
echo [OK] Backend stopped

echo.
echo ========================================
echo   All servers stopped!
echo ========================================
pause
