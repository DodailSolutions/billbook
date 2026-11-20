@echo off
title BillBooky CCTV Vision Bridge & Signal Booster
cd /d %~dp0
echo ==========================================================
echo  Starting BillBooky CCTV Vision Bridge & Signal Booster
echo ==========================================================
echo Port: 5050 ^| WebSocket: ws://127.0.0.1:5050/ws/stream
echo.

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Python is not installed. Please install Python 3.9+ from python.org.
    pause
    exit /b 1
)

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
echo Checking dependencies...
pip install -q -r requirements.txt

echo Starting Vision Bridge on port 5050...
python server.py
pause
