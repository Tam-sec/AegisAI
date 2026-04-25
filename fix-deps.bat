@echo off
REM Quick reinstall script to fix dependency issues
cd backend
call venv\Scripts\activate.bat
pip install --upgrade -r requirements.txt
cd ..
echo [OK] Dependencies updated. You can now run start-local.py again.
pause
