@echo off
TITLE TRACKIQ Backend Server (Port 8011)
echo ===================================================
echo   STARTING TRACKIQ FASTAPI BACKEND SERVER (PORT 8011)
echo ===================================================
cd /d "%~dp0"
echo Working Directory: %CD%
echo.

python -m uvicorn backend.main:app --host 0.0.0.0 --port 8011

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ===================================================
    echo [ERROR] Backend crashed or failed to start with code %ERRORLEVEL%
    echo ===================================================
)

pause
