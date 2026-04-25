@echo off
cd /d "%~dp0backend"
call venv\Scripts\activate.bat
uvicorn main:app --reload --port 8001 --host 0.0.0.0
pause